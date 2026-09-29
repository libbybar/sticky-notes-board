import React, { useLayoutEffect, useRef } from 'react';
import * as S from '../style/StickyNote.styles';
import { renderFormattedText, useFormattedField, handleFormatShortcut } from '../utils/richText';
import FormattingToolbar from './FormattingToolbar';
import ChecklistItemField from './ChecklistItemField';
import { STICKY_NOTE_TEXT_LABEL } from '../ui-texts';

const NoteContentEditor = ({
  id,
  isChecklist,
  checklistItems,
  text,
  completed,
  onUpdateText,
  onAddChecklistItem,
  onUpdateChecklistItemText,
  onToggleChecklistItem,
  onDeleteChecklistItem
}) => {
  const itemRefs = useRef({});
  const taskTextRef = useRef(null);
  const pendingFocusIndexRef = useRef(null);
  const prevItemsLengthRef = useRef(checklistItems.length);
  const prevIsChecklistRef = useRef(isChecklist);
  const taskTextFormatting = useFormattedField(text || '', taskTextRef);

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

  // useLayoutEffect (not useEffect) so this focus restoration commits synchronously with
  // the DOM change that triggered it, instead of as a deferred passive effect - matching
  // the same reasoning as the caret-restoration effect in useFormattedField.
  useLayoutEffect(() => {
    const wasChecklist = prevIsChecklistRef.current;
    prevIsChecklistRef.current = isChecklist;

    // Just converted to a checklist: move focus to the first item ourselves, so the
    // header's convert button doesn't need to reach into our internal refs.
    if (isChecklist && !wasChecklist) {
      focusItemAtEnd(itemRefs.current[checklistItems[0]?.id]);
      prevItemsLengthRef.current = checklistItems.length;
      return;
    }
    // Just converted back to plain text: focus the text field the same way.
    if (!isChecklist && wasChecklist) {
      focusItemAtEnd(taskTextRef.current);
      return;
    }

    if (isChecklist && pendingFocusIndexRef.current !== null && checklistItems.length !== prevItemsLengthRef.current) {
      const targetIndex = Math.min(pendingFocusIndexRef.current, checklistItems.length - 1);
      const targetItem = checklistItems[targetIndex];
      focusItemAtEnd(targetItem && itemRefs.current[targetItem.id]);
      pendingFocusIndexRef.current = null;
    }
    prevItemsLengthRef.current = checklistItems.length;
  }, [isChecklist, checklistItems]);

  return (
    <S.ContentArea dir="rtl">
      {isChecklist ? (
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
  );
};

export default NoteContentEditor;
