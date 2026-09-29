import React, { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as S from '../style/StickyNote.styles';
import { renderFormattedText, useFormattedField, handleFormatShortcut } from '../utils/richText';
import {
  PinRedIcon,
  PinBlueIcon,
  NoteDeleteIcon as DeleteIcon,
  TaskInProgressIcon as InProgressIcon,
  TaskCompleteIcon as CompleteIcon,
  TaskIcon,
  CalendarIcon,
  CheckIcon,
  NoteToListIcon
} from '../assets/icons';
import { DEFAULT_COLOR, DEFAULT_BORDER } from '../style/style-constants';
import { CATEGORY_GENERAL, STATUS_PENDING, STATUS_IN_PROGRESS, STATUS_COMPLETED } from '../constants';
import {
  STICKY_NOTE_DELETE_TITLE,
  STICKY_NOTE_TITLE_PLACEHOLDER,
  STICKY_NOTE_TEXT_LABEL,
  STICKY_NOTE_DATE_LABEL,
  STICKY_NOTE_CATEGORY_LABEL,
  STICKY_NOTE_SELECT_LABEL,
  STICKY_NOTE_MARK_IMPORTANT,
  STICKY_NOTE_UNMARK_IMPORTANT,
  STICKY_NOTE_NO_DEADLINE_LABEL,
  STICKY_NOTE_OVERDUE_BADGE,
  STICKY_NOTE_CREATED_AT,
  STICKY_NOTE_CHECK_TITLE_PENDING,
  STICKY_NOTE_CHECK_TITLE_IN_PROGRESS,
  STICKY_NOTE_CHECK_TITLE_COMPLETED,
  STICKY_NOTE_CONVERT_TO_CHECKLIST_LABEL,
  STICKY_NOTE_CONVERT_TO_TEXT_LABEL,
  STICKY_NOTE_CHECKLIST_ITEM_LABEL,
  STICKY_NOTE_CHECKLIST_ITEM_TEXT_LABEL,
  STICKY_NOTE_BOLD_LABEL,
  STICKY_NOTE_ITALIC_LABEL
} from '../ui-texts';

// Selecting text inside a rotated/scaled note (NoteContainer has a CSS transform) would break
// position: fixed math if rendered in place - a transform creates a new containing block for
// fixed-position descendants. Portaling to document.body keeps the toolbar truly viewport-fixed.
const TOOLBAR_MARGIN = 8;
const TOOLBAR_HALF_WIDTH = 60;
const TOOLBAR_HEIGHT = 40;

const FormattingToolbar = ({ rect, onBold, onItalic }) => {
  // preventDefault() on touchstart (needed so tapping the toolbar doesn't blur/collapse the
  // field's selection first) can suppress the click some touch browsers would otherwise
  // synthesize afterward. Firing the action directly on touchend sidesteps that, and this
  // flag stops it from also firing a second time if a click does still follow.
  const touchHandledRef = useRef(false);

  if (!rect) return null;

  const left = Math.min(
    Math.max(rect.left + rect.width / 2, TOOLBAR_HALF_WIDTH),
    window.innerWidth - TOOLBAR_HALF_WIDTH
  );
  // Flips below the selection when there isn't room above (e.g. a note scrolled near the
  // top of the viewport), so the toolbar doesn't render off-screen.
  const showBelow = rect.top < TOOLBAR_HEIGHT + TOOLBAR_MARGIN;
  const style = showBelow
    ? { top: rect.bottom + TOOLBAR_MARGIN, left, transform: 'translate(-50%, 0)' }
    : { top: rect.top - TOOLBAR_MARGIN, left, transform: 'translate(-50%, -100%)' };

  const bind = (action) => ({
    onTouchEnd: (e) => {
      e.preventDefault();
      touchHandledRef.current = true;
      action();
    },
    onClick: () => {
      if (touchHandledRef.current) {
        touchHandledRef.current = false;
        return;
      }
      action();
    }
  });

  return createPortal(
    <S.FormatToolbar
      style={style}
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
    >
      <S.FormatToolbarButton type="button" aria-label={STICKY_NOTE_BOLD_LABEL} {...bind(onBold)}>
        <strong>B</strong>
      </S.FormatToolbarButton>
      <S.FormatToolbarButton type="button" aria-label={STICKY_NOTE_ITALIC_LABEL} {...bind(onItalic)}>
        <em>I</em>
      </S.FormatToolbarButton>
    </S.FormatToolbar>,
    document.body
  );
};

const ChecklistItemField = ({
  id,
  item,
  index,
  total,
  completed,
  onToggleChecklistItem,
  onUpdateChecklistItemText,
  onItemKeyDown,
  registerRef
}) => {
  const elRef = useRef(null);
  const formatting = useFormattedField(item.text, elRef);

  return (
    <S.ChecklistItemRow>
      <S.ChecklistCheckboxWrapper>
        <S.ChecklistCheckbox
          type="checkbox"
          aria-label={STICKY_NOTE_CHECKLIST_ITEM_LABEL(index + 1, total, item.text)}
          checked={!!item.checked}
          disabled={completed}
          onChange={() => onToggleChecklistItem && onToggleChecklistItem(id, item.id)}
        />
      </S.ChecklistCheckboxWrapper>
      <S.ChecklistItemText
        ref={(el) => { elRef.current = el; registerRef(item.id, el); }}
        role="textbox"
        aria-label={STICKY_NOTE_CHECKLIST_ITEM_TEXT_LABEL(index + 1, total)}
        aria-multiline="true"
        aria-readonly={completed}
        $isChecked={!!item.checked}
        contentEditable={!completed}
        suppressContentEditableWarning={true}
        onFocus={formatting.handleFocus}
        onBlur={(e) => {
          formatting.handleBlur();
          onUpdateChecklistItemText && onUpdateChecklistItemText(id, item.id, e.target.textContent);
        }}
        onKeyDown={(e) => {
          if (handleFormatShortcut(e, formatting)) return;
          onItemKeyDown(e, index, item.id);
        }}
      >
        {formatting.isEditing ? item.text : renderFormattedText(item.text)}
      </S.ChecklistItemText>
      <FormattingToolbar rect={formatting.selectionRect} onBold={formatting.applyBold} onItalic={formatting.applyItalic} />
    </S.ChecklistItemRow>
  );
};

const StickyNote = ({
  task,
  categoryInfo,
  categories,
  onUpdateCategory,
  onUpdateStatus,
  onDelete,
  onUpdateText,
  onUpdateTitle,
  onUpdateDeadline,
  onToggleImportant,
  onConvertToChecklist,
  onConvertToText,
  onAddChecklistItem,
  onUpdateChecklistItemText,
  onToggleChecklistItem,
  onDeleteChecklistItem,
  isSelected,
  isSelectionMode,
  onToggleSelect }) => {

  const itemRefs = useRef({});
  const taskTextRef = useRef(null);
  const titleRef = useRef(null);
  const pendingFocusIndexRef = useRef(null);
  const pendingFocusPlainTextRef = useRef(false);
  const prevItemsLengthRef = useRef(task?.checklistItems?.length ?? 0);
  const taskTextFormatting = useFormattedField(task?.text || '', taskTextRef);
  const titleFormatting = useFormattedField(task?.title || '', titleRef);

  // el.focus() alone doesn't reliably show a caret in a contentEditable box,
  // so typing right after a programmatic focus can be silently dropped.
  const focusItemAtEnd = (el) => {
    if (!el) return;
    el.focus();
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (e) {
      // Selection API unsupported in this environment; the focus() above still applies.
    }
  };

  // Real layout lets us tell whether the caret is on the item's first/last visual line,
  // so the arrows can move within a multi-line item instead of always jumping items.
  // In environments without layout (e.g. jsdom) every rect comes back empty, so this
  // falls back to "always at the edge" - i.e. today's jump-between-items behavior.
  const isCaretAtVerticalEdge = (el, edge) => {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return true;
      const range = selection.getRangeAt(0).cloneRange();
      range.collapse(true);
      const caretRect = range.getClientRects()[0];
      const elRect = el.getBoundingClientRect();
      if (!caretRect || elRect.height === 0) return true;
      const tolerance = 4;
      return edge === 'top'
        ? caretRect.top - elRect.top <= tolerance
        : elRect.bottom - caretRect.bottom <= tolerance;
    } catch (e) {
      // Selection API unsupported or in an unexpected state - default to jumping items.
      return true;
    }
  };

  // useLayoutEffect (not useEffect) so this focus restoration commits synchronously with
  // the DOM change that triggered it, instead of as a deferred passive effect - matching
  // the same reasoning as the caret-restoration effect in useFormattedField.
  useLayoutEffect(() => {
    const items = task?.checklistItems || [];
    if (pendingFocusIndexRef.current !== null && items.length !== prevItemsLengthRef.current) {
      const targetIndex = Math.min(pendingFocusIndexRef.current, items.length - 1);
      const targetItem = items[targetIndex];
      const el = targetItem && itemRefs.current[targetItem.id];
      focusItemAtEnd(el);
      pendingFocusIndexRef.current = null;
    }
    prevItemsLengthRef.current = items.length;

    if (pendingFocusPlainTextRef.current && task && !task.isChecklist) {
      focusItemAtEnd(taskTextRef.current);
      pendingFocusPlainTextRef.current = false;
    }
  }, [task]);

  if (!task) {
    return null;
  }
  const {
    id = "N/A",
    title = "",
    text = "",
    category = CATEGORY_GENERAL,
    deadline = '',
    completed = false,
    rotation = 0,
    isImportant,
    isChecklist = false,
    checklistItems = []
  } = task;

  const handleItemKeyDown = (e, index, itemId) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const edge = e.key === 'ArrowUp' ? 'top' : 'bottom';
      if (!isCaretAtVerticalEdge(e.target, edge)) return; // let the caret move within a multi-line item
      const targetItem = checklistItems[e.key === 'ArrowUp' ? index - 1 : index + 1];
      if (targetItem) {
        e.preventDefault();
        focusItemAtEnd(itemRefs.current[targetItem.id]);
      }
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      pendingFocusIndexRef.current = index + 1;
      onAddChecklistItem && onAddChecklistItem(id, index);
      return;
    }
    // Shift+Enter is left to the browser: it inserts a plain line break within the item.
    if (e.key === 'Backspace' && e.target.textContent.trim() === '' && checklistItems.length > 1) {
      e.preventDefault();
      pendingFocusIndexRef.current = Math.max(index - 1, 0);
      onDeleteChecklistItem && onDeleteChecklistItem(id, itemId);
    }
  };

  const isOverdue = deadline &&  // יש כפילות, כי אצל האמא יש פונקצית עזר שבודקת את זה, אבל אני בוחרת להשאיר כאן כי זאת הגנה נדרשת בעיניי גם פה 
    new Date(deadline) < new Date().setHours(0, 0, 0, 0) &&
    !completed;

 const bgColor = categoryInfo?.color ?? DEFAULT_COLOR;
  const borderColor = categoryInfo?.borderColor ?? DEFAULT_BORDER;

  const handleUpdateStatus = (e) => { //הגנה - עוצר את הלחיצה על הפתק כאן ומונע ביעבוע של האירוע לאמא
    e.stopPropagation();
    if (typeof onUpdateStatus === 'function') {
      onUpdateStatus(task.id);
    }
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    if (typeof onDelete === 'function') onDelete(id);
  };
  const importantLabel = isImportant ? STICKY_NOTE_UNMARK_IMPORTANT : STICKY_NOTE_MARK_IMPORTANT;
  const checkTitle = task.status === STATUS_PENDING ? STICKY_NOTE_CHECK_TITLE_PENDING :
    task.status === STATUS_IN_PROGRESS ? STICKY_NOTE_CHECK_TITLE_IN_PROGRESS :
      STICKY_NOTE_CHECK_TITLE_COMPLETED;
  const deadlineValue = deadline ? new Date(deadline).toISOString().split('T')[0] : '';
  const formattedDeadline = deadline ? new Date(deadline).toLocaleDateString('he-IL') : '';

  return (
    <S.NoteContainer
      $bgColor={bgColor}
      $borderColor={borderColor}
      $rotation={rotation}
      $isSelected={isSelected}
      $isSelectionMode={isSelectionMode}
      $isImportant={!!isImportant}
    >
      <S.PinWrapper $status={task.status} $rotation={task.pinRotation}>
        {task.status === STATUS_IN_PROGRESS
          ? <PinBlueIcon width={30} height={30} aria-hidden="true" />
          : <PinRedIcon width={30} height={30} aria-hidden="true" />}
      </S.PinWrapper>

      <S.ImportantCorner
        type="button"
        $isImportant={!!isImportant}
        aria-label={importantLabel}
        data-tooltip={importantLabel}
        onClick={() => onToggleImportant && onToggleImportant(id)}
      >
        <S.CornerShape $isImportant={!!isImportant} $bgColor={bgColor} />
      </S.ImportantCorner>

      <S.NoteHeaderArea>
        <S.TopRow>
          <S.HeaderActions>
            {isSelectionMode && (
              <S.CustomSelectionCircle
                type="button"
                aria-label={STICKY_NOTE_SELECT_LABEL}
                aria-pressed={!!isSelected}
                $isSelected={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect();
                }}
              >
                {isSelected && <CheckIcon width={11} height={11} color="white" aria-hidden="true" />}
              </S.CustomSelectionCircle>
            )}
            <S.CategoryTag
              aria-label={STICKY_NOTE_CATEGORY_LABEL}
              value={category}
              onChange={(e) => onUpdateCategory(id, e.target.value)}
            >
              {categories && categories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </S.CategoryTag>
          </S.HeaderActions>
          <S.TopRowActions>
            {!completed && (
              <S.ChecklistToggleButton
                type="button"
                aria-label={isChecklist ? STICKY_NOTE_CONVERT_TO_TEXT_LABEL : STICKY_NOTE_CONVERT_TO_CHECKLIST_LABEL}
                data-tooltip={isChecklist ? STICKY_NOTE_CONVERT_TO_TEXT_LABEL : STICKY_NOTE_CONVERT_TO_CHECKLIST_LABEL}
                onClick={() => {
                  if (isChecklist) {
                    pendingFocusPlainTextRef.current = true;
                    onConvertToText && onConvertToText(id);
                  } else {
                    pendingFocusIndexRef.current = 0;
                    onConvertToChecklist && onConvertToChecklist(id);
                  }
                }}
              >
                <NoteToListIcon width={14} height={14} aria-hidden="true" />
              </S.ChecklistToggleButton>
            )}
            <S.DeleteBtn onClick={handleDelete} aria-label={STICKY_NOTE_DELETE_TITLE} data-tooltip={STICKY_NOTE_DELETE_TITLE}>
              <DeleteIcon width={14} height={14} aria-hidden="true" />
            </S.DeleteBtn>
          </S.TopRowActions>
        </S.TopRow>

        <S.HeaderRow>
          <S.TitleInput
            ref={titleRef}
            role="textbox"
            aria-label={STICKY_NOTE_TITLE_PLACEHOLDER}
            aria-multiline="false"
            aria-readonly={completed}
            contentEditable={!completed}
            suppressContentEditableWarning={true}
            $isCompleted={completed}
            onFocus={titleFormatting.handleFocus}
            onBlur={(e) => {
              titleFormatting.handleBlur();
              onUpdateTitle && onUpdateTitle(id, e.target.textContent);
            }}
            onKeyDown={(e) => {
              if (handleFormatShortcut(e, titleFormatting)) return;
              if (e.key !== 'Enter') return;
              e.preventDefault();
              // A single-line title has no legitimate line break, but Shift+Enter
              // should just be ignored here, not kick the user out of the field.
              if (!e.shiftKey) {
                e.target.blur();
              }
            }}
          >
            {titleFormatting.isEditing ? title : renderFormattedText(title)}
          </S.TitleInput>
          <FormattingToolbar rect={titleFormatting.selectionRect} onBold={titleFormatting.applyBold} onItalic={titleFormatting.applyItalic} />
        </S.HeaderRow>
      </S.NoteHeaderArea>

      <S.ContentArea dir="rtl">
        {isChecklist ? (
          <>
            <S.ChecklistList>
              {checklistItems.map((item, index) => (
                <ChecklistItemField
                  key={item.id}
                  id={id}
                  item={item}
                  index={index}
                  total={checklistItems.length}
                  completed={completed}
                  onToggleChecklistItem={onToggleChecklistItem}
                  onUpdateChecklistItemText={onUpdateChecklistItemText}
                  onItemKeyDown={handleItemKeyDown}
                  registerRef={(itemId, el) => { itemRefs.current[itemId] = el; }}
                />
              ))}
            </S.ChecklistList>
          </>
        ) : (
          <>
            <S.TaskText
              ref={taskTextRef}
              role="textbox"
              aria-label={STICKY_NOTE_TEXT_LABEL}
              aria-multiline="true"
              aria-readonly={completed}
              $isCompleted={completed}
              contentEditable={!completed}
              suppressContentEditableWarning={true}
              onFocus={taskTextFormatting.handleFocus}
              onBlur={(e) => {
                taskTextFormatting.handleBlur();
                onUpdateText && onUpdateText(id, e.target.textContent);
              }}
              onKeyDown={(e) => {
                if (handleFormatShortcut(e, taskTextFormatting)) return;
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.target.blur();
                }
              }}
            >
              {taskTextFormatting.isEditing ? text : renderFormattedText(text)}
            </S.TaskText>
            <FormattingToolbar rect={taskTextFormatting.selectionRect} onBold={taskTextFormatting.applyBold} onItalic={taskTextFormatting.applyItalic} />
          </>
        )}
      </S.ContentArea>

      <S.Footer>
        <S.FooterInfo>
          <S.DeadlineRow>
            <CalendarIcon width={11} height={11} aria-hidden="true" />
            <S.DateText
              type="date"
              aria-label={STICKY_NOTE_DATE_LABEL}
              $isOverdue={isOverdue}
              value={deadlineValue}
              onChange={(e) => onUpdateDeadline && onUpdateDeadline(id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {isOverdue && <S.OverdueBadge>{STICKY_NOTE_OVERDUE_BADGE}</S.OverdueBadge>}
            <S.DisplayDate $isOverdue={isOverdue}>
              {deadline ? formattedDeadline : STICKY_NOTE_NO_DEADLINE_LABEL}
            </S.DisplayDate>
          </S.DeadlineRow>
          <S.CreationDate>
            {STICKY_NOTE_CREATED_AT(new Date(task.createdAt).toLocaleDateString('he-IL'))}
          </S.CreationDate>
        </S.FooterInfo>

        <S.ActionButtons>
          <S.CheckButton
            $isCompleted={completed}
            $status={task.status || STATUS_PENDING}
            onClick={handleUpdateStatus}
            aria-label={checkTitle}
            data-tooltip={checkTitle}
          >
            {task.status === STATUS_IN_PROGRESS
              ? <InProgressIcon width={18} height={18} aria-hidden="true" />
              : task.status === STATUS_COMPLETED
                ? <CompleteIcon width={18} height={18} aria-hidden="true" />
                : <TaskIcon width={18} height={18} aria-hidden="true" />}
          </S.CheckButton>
        </S.ActionButtons>
      </S.Footer>
    </S.NoteContainer>
  );
};

export default StickyNote;