import React, { useState } from 'react';
import * as S from './TaskInput.styles';
import { PlusCircle } from 'lucide-react';
import ValidationTooltip from './ValidationTooltip';

const TaskInput = ({ onAdd, categories }) => {
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || 'כללי');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // מונע מהדף להתרענן
if (!text.trim()) {
      setError('נדרש טקסט כדי להדביק פתק');
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
          placeholder="מה נדביק על הלוח?"
          value={text}
          onChange={(e) => {
            if (error) setError(''); 
            setText(e.target.value);
          }}
          autoComplete="off"
        />
        
        <S.DateInput
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <S.CategorySelect
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
          <span>להדביק</span>
          <PlusCircle size={20} />
        </S.AddButton>
      </S.StyledForm>
    </S.InputContainer>
  );
};

export default TaskInput;