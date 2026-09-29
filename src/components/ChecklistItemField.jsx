import React, { useRef } from 'react';
import * as S from '../style/StickyNote.styles';
import { renderFormattedText, useFormattedField, handleFormatShortcut } from '../utils/richText';
import FormattingToolbar from './FormattingToolbar';
import {
  STICKY_NOTE_CHECKLIST_ITEM_LABEL,
  STICKY_NOTE_CHECKLIST_ITEM_TEXT_LABEL
} from '../ui-texts';

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

export default ChecklistItemField;
