import React, { useState } from 'react';
import * as S from '../style/TaskInput.styles';
import { PlusCircle } from 'lucide-react';
import ValidationTooltip from './ValidationTooltip';
import {
  TASK_INPUT_ERROR_EMPTY,
  TASK_INPUT_PLACEHOLDER,
  TASK_INPUT_SUBMIT_BUTTON,
  TASK_INPUT_DATE_LABEL,
  TASK_INPUT_CATEGORY_LABEL
} from '../ui-texts';
import { CATEGORY_GENERAL } from '../constants';

const TaskInput = ({ onAdd, categories }) => {
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || CATEGORY_GENERAL);
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  if (selectedCategory !== CATEGORY_GENERAL && !categories.some(cat => cat.name === selectedCategory)) {
    setSelectedCategory(CATEGORY_GENERAL);
  }

  const handleSubmit = (e) => {
    e.preventDefault(); // מונע מהדף להתרענן
if (!text.trim()) {
      setError(TASK_INPUT_ERROR_EMPTY);
      return;

    }    const randomPinRotation = Math.floor(Math.random() * 61) - 30;

    onAdd({
      id: Date.now(),
      text: text,
      category: selectedCategory,
      deadline: deadline,
      completed: false,
      rotation: Math.floor(Math.random() * 10) - 5,
      pinRotation: randomPinRotation
    });

    setText('');
    setDeadline('');
    setError('');
  }

    return (
    <S.InputContainer style={{ position: 'relative' }}>
      <ValidationTooltip message={error} onClear={() => setError('')} />

      <S.StyledForm onSubmit={handleSubmit}>
        <S.TextInput
          type="text"
          placeholder={TASK_INPUT_PLACEHOLDER}
          aria-label={TASK_INPUT_PLACEHOLDER}
          value={text}
          onChange={(e) => {
            if (error) setError(''); 
            setText(e.target.value);
          }}
          autoComplete="off"
        />
        
        <S.DateInput
          type="date"
          aria-label={TASK_INPUT_DATE_LABEL}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <S.CategorySelect
          aria-label={TASK_INPUT_CATEGORY_LABEL}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </S.CategorySelect>

        <S.AddButton type="submit">
          <span>{TASK_INPUT_SUBMIT_BUTTON}</span>
          <PlusCircle size={20} />
        </S.AddButton>
      </S.StyledForm>
    </S.InputContainer>
  );
};

export default TaskInput;