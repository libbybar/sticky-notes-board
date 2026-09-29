import React, { useState } from 'react';
import * as S from '../style/CreateNote.styles';
import * as N from '../style/StickyNote.styles';
import { NoteAddIcon as AddIcon, CalendarIcon } from '../assets/icons';
import ValidationTooltip from './ValidationTooltip';
import {
  CREATE_NOTE_HEADING,
  CREATE_NOTE_TITLE_LABEL,
  CREATE_NOTE_CONTENT_PLACEHOLDER,
  CREATE_NOTE_CONTENT_LABEL,
  TASK_INPUT_ERROR_EMPTY,
  TASK_INPUT_SUBMIT_BUTTON,
  TASK_INPUT_DATE_LABEL,
  TASK_INPUT_CATEGORY_LABEL,
  STICKY_NOTE_TITLE_PLACEHOLDER,
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

  if (selectedCategory !== CATEGORY_GENERAL && !categories.some(cat => cat.name === selectedCategory)) {
    setSelectedCategory(CATEGORY_GENERAL);
  }

  const categoryInfo = categories.find(cat => cat.name === selectedCategory);
  const bgColor = categoryInfo?.color ?? DEFAULT_COLOR;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError(TASK_INPUT_ERROR_EMPTY);
      return;
    }
    const randomPinRotation = Math.floor(Math.random() * 61) - 30;

    onAdd({
      title,
      text,
      category: selectedCategory,
      deadline,
      pinRotation: randomPinRotation
    });

    setTitle('');
    setText('');
    setSelectedCategory(CATEGORY_GENERAL);
    setDeadline('');
    setError('');
  };

  return (
    <S.CreateNoteForm onSubmit={handleSubmit} $bgColor={bgColor}>
      <ValidationTooltip message={error} onClear={() => setError('')} />

      <S.Heading>{CREATE_NOTE_HEADING}</S.Heading>

      <S.TitleField
        type="text"
        placeholder={STICKY_NOTE_TITLE_PLACEHOLDER}
        aria-label={CREATE_NOTE_TITLE_LABEL}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoComplete="off"
      />

      <S.ContentField
        placeholder={CREATE_NOTE_CONTENT_PLACEHOLDER}
        aria-label={CREATE_NOTE_CONTENT_LABEL}
        rows={3}
        value={text}
        onChange={(e) => {
          if (error) setError('');
          setText(e.target.value);
        }}
      />

      <S.DetailsRow>
        <N.CategoryTag
          aria-label={TASK_INPUT_CATEGORY_LABEL}
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
            aria-label={TASK_INPUT_DATE_LABEL}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <N.DisplayDate>
            {deadline ? formatDeadline(deadline) : STICKY_NOTE_NO_DEADLINE_LABEL}
          </N.DisplayDate>
        </N.DeadlineRow>
      </S.DetailsRow>

      <S.SubmitButton type="submit">
        <span>{TASK_INPUT_SUBMIT_BUTTON}</span>
        <AddIcon width={20} height={20} aria-hidden="true" />
      </S.SubmitButton>
    </S.CreateNoteForm>
  );
};

export default CreateNote;
