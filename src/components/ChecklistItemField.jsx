import React, { useRef } from 'react';
import * as S from '../style/StickyNote.styles';
import { renderFormattedText, useFormattedField, handleFormatShortcut } from '../utils/richText';
import FormatBar from './FormatBar';
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
  const formatting = useFormattedField(
    item.text,
    elRef,
    (text) => onUpdateChecklistItemText && onUpdateChecklistItemText(id, item.id, text)
  );

  return (
    <S.ChecklistItemRow>
      <S.ChecklistItemMain>
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
          onBlur={formatting.handleBlur}
          onKeyDown={(e) => {
            if (handleFormatShortcut(e, formatting)) return;
            onItemKeyDown(e, index, item.id);
          }}
        >
          {formatting.isEditing ? item.text : renderFormattedText(item.text)}
        </S.ChecklistItemText>
      </S.ChecklistItemMain>
      <FormatBar isEditing={formatting.isEditing} onBold={formatting.applyBold} onItalic={formatting.applyItalic} onBlur={formatting.handleBlur} />
    </S.ChecklistItemRow>
  );
};

export default ChecklistItemField;
