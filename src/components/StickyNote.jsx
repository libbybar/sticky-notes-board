import React, { useRef } from 'react';
import * as S from '../style/StickyNote.styles';
import { renderFormattedText, useFormattedField, handleFormatShortcut } from '../utils/richText';
import { formatDeadline } from '../utils/dateFormat';
import { isTaskOverdue } from '../utils/taskDeadline';
import FormatBar from './FormatBar';
import NoteContentEditor from './NoteContentEditor';
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
  STICKY_NOTE_CONVERT_TO_TEXT_LABEL
} from '../ui-texts';

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

  const titleRef = useRef(null);
  const titleFormatting = useFormattedField(
    task?.title || '',
    titleRef,
    (text) => onUpdateTitle && onUpdateTitle(task?.id, text)
  );

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

  const isOverdue = isTaskOverdue(task);

 const bgColor = categoryInfo?.color ?? DEFAULT_COLOR;
  const borderColor = categoryInfo?.borderColor ?? DEFAULT_BORDER;

  const handleUpdateStatus = (e) => {
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
  const statusActionLabel = task.status === STATUS_PENDING ? STICKY_NOTE_CHECK_TITLE_PENDING :
    task.status === STATUS_IN_PROGRESS ? STICKY_NOTE_CHECK_TITLE_IN_PROGRESS :
      STICKY_NOTE_CHECK_TITLE_COMPLETED;
  const deadlineValue = deadline ? new Date(deadline).toISOString().split('T')[0] : '';
  const formattedDeadline = deadline ? formatDeadline(deadline) : '';

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
                    onConvertToText && onConvertToText(id);
                  } else {
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
            onBlur={titleFormatting.handleBlur}
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
        </S.HeaderRow>
        <FormatBar isEditing={titleFormatting.isEditing} onBold={titleFormatting.applyBold} onItalic={titleFormatting.applyItalic} onBlur={titleFormatting.handleBlur} />
      </S.NoteHeaderArea>

      <NoteContentEditor
        id={id}
        isChecklist={isChecklist}
        checklistItems={checklistItems}
        text={text}
        completed={completed}
        onUpdateText={onUpdateText}
        onAddChecklistItem={onAddChecklistItem}
        onUpdateChecklistItemText={onUpdateChecklistItemText}
        onToggleChecklistItem={onToggleChecklistItem}
        onDeleteChecklistItem={onDeleteChecklistItem}
      />

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
            aria-label={statusActionLabel}
            data-tooltip={statusActionLabel}
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
