import React, { useRef, useState } from 'react';
import * as S from '../style/CreateNote.styles';
import * as N from '../style/StickyNote.styles';
import { NoteAddIcon as AddIcon, CalendarIcon } from '../assets/icons';
import ValidationTooltip from './ValidationTooltip';
import FormatBar from './FormatBar';
import {
  renderFieldText,
  useFormattedField,
  handleFormatShortcut,
  insertTextAtCaret
} from '../utils/richText';
import {
  CREATE_NOTE_HEADING,
  CREATE_NOTE_TITLE_LABEL,
  CREATE_NOTE_CONTENT_LABEL,
  CREATE_NOTE_ERROR_EMPTY,
  CREATE_NOTE_SUBMIT_BUTTON,
  CREATE_NOTE_DATE_LABEL,
  CREATE_NOTE_CATEGORY_LABEL,
  STICKY_NOTE_NO_DEADLINE_LABEL
} from '../ui-texts';
import { CATEGORY_GENERAL } from '../constants';
import { DEFAULT_COLOR } from '../style/style-constants';
import { formatDeadline } from '../utils/dateFormat';

const CreateNote = ({ onAdd, categories }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_GENERAL);
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  // Bumped on every successful submit to force the title/content fields to remount
  // (see the `key`s below) instead of being reconciled: a field submitted without
  // blurring first never synced its typed text into React state, so React's diff
  // still thinks it's already empty and skips clearing the (still-visible) DOM text.
  // A remount skips that stale diff entirely and starts the field genuinely empty.
  const [resetKey, setResetKey] = useState(0);
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const titleFormatting = useFormattedField(title, titleRef, setTitle);
  const contentFormatting = useFormattedField(text, contentRef, setText);

  if (selectedCategory !== CATEGORY_GENERAL && !categories.some(cat => cat.name === selectedCategory)) {
    setSelectedCategory(CATEGORY_GENERAL);
  }

  const categoryInfo = categories.find(cat => cat.name === selectedCategory);
  const bgColor = categoryInfo?.color ?? DEFAULT_COLOR;

  const handleSubmit = (e) => {
    e.preventDefault();
    // `title`/`text` state only syncs on blur, and tapping "Submit" while a field is
    // still focused doesn't reliably blur it first on touch devices (the click can
    // fire before the blur does), so the state can be stale mid-edit - the raw DOM
    // text is the source of truth then. But once a field HAS blurred, it switches to
    // showing the *formatted* view (markers stripped, wrapped in <strong>/<em>), so
    // its DOM text no longer has the raw *bold*/_italic_ markers - state is the only
    // place those survive at that point. Each field's own `isEditing` flag says which
    // one is trustworthy right now.
    const currentTitle = titleFormatting.isEditing && titleRef.current ? titleRef.current.textContent : title;
    const currentText = contentFormatting.isEditing && contentRef.current ? contentRef.current.textContent : text;

    if (!currentText.trim()) {
      setError(CREATE_NOTE_ERROR_EMPTY);
      return;
    }
    const randomPinRotation = Math.floor(Math.random() * 61) - 30;

    onAdd({
      title: currentTitle,
      text: currentText,
      category: selectedCategory,
      deadline,
      pinRotation: randomPinRotation
    });

    setTitle('');
    setText('');
    // A submit that skipped blur (the whole reason it read the live DOM above) never
    // closed edit mode either, so without this, FormatBar would reappear next to the
    // freshly emptied, remounted field.
    titleFormatting.reset();
    contentFormatting.reset();
    setResetKey(k => k + 1);
    setSelectedCategory(CATEGORY_GENERAL);
    setDeadline('');
    setError('');
  };

  return (
    <S.CreateNoteForm onSubmit={handleSubmit} $bgColor={bgColor}>
      <ValidationTooltip message={error} onClear={() => setError('')} />

      <S.Heading>{CREATE_NOTE_HEADING}</S.Heading>

      <S.TitleField
        key={`title-${resetKey}`}
        ref={titleRef}
        role="textbox"
        aria-label={CREATE_NOTE_TITLE_LABEL}
        aria-multiline="false"
        contentEditable
        suppressContentEditableWarning={true}
        onFocus={titleFormatting.handleFocus}
        onBlur={titleFormatting.handleBlur}
        onKeyDown={(e) => {
          if (handleFormatShortcut(e, titleFormatting)) return;
          if (e.key !== 'Enter') return;
          e.preventDefault();
          if (!e.shiftKey) {
            e.target.blur();
          }
        }}
      >
        {renderFieldText(title, titleFormatting.isEditing)}
      </S.TitleField>
      <FormatBar isEditing={titleFormatting.isEditing} onBold={titleFormatting.applyBold} onItalic={titleFormatting.applyItalic} onBlur={titleFormatting.handleBlur} />

      <S.ContentField
        key={`content-${resetKey}`}
        ref={contentRef}
        role="textbox"
        aria-label={CREATE_NOTE_CONTENT_LABEL}
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning={true}
        onFocus={contentFormatting.handleFocus}
        onBlur={contentFormatting.handleBlur}
        onInput={() => {
          if (error) setError('');
        }}
        onKeyDown={(e) => {
          if (handleFormatShortcut(e, contentFormatting)) return;
          if (e.key === 'Enter') {
            e.preventDefault();
            insertTextAtCaret(e.target, '\n');
          }
        }}
      >
        {renderFieldText(text, contentFormatting.isEditing)}
      </S.ContentField>
      <FormatBar isEditing={contentFormatting.isEditing} onBold={contentFormatting.applyBold} onItalic={contentFormatting.applyItalic} onBlur={contentFormatting.handleBlur} />

      <S.DetailsRow>
        <N.CategoryTag
          aria-label={CREATE_NOTE_CATEGORY_LABEL}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </N.CategoryTag>

        <N.DeadlineRow>
          <CalendarIcon width={11} height={11} aria-hidden="true" />
          <N.DateText
            type="date"
            aria-label={CREATE_NOTE_DATE_LABEL}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <N.DisplayDate>
            {deadline ? formatDeadline(deadline) : STICKY_NOTE_NO_DEADLINE_LABEL}
          </N.DisplayDate>
        </N.DeadlineRow>
      </S.DetailsRow>

      <S.SubmitButton type="submit">
        <span>{CREATE_NOTE_SUBMIT_BUTTON}</span>
        <AddIcon width={20} height={20} aria-hidden="true" />
      </S.SubmitButton>
    </S.CreateNoteForm>
  );
};

export default CreateNote;
