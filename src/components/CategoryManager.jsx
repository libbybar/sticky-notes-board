import React, { useState } from 'react';
import * as S from '../style/CategoryManager.styles';
import { Plus, X, Palette } from 'lucide-react';
import ValidationTooltip from './ValidationTooltip';
import {
  CATEGORY_MANAGER_ERROR_EMPTY,
  CATEGORY_MANAGER_ERROR_DUPLICATE,
  CATEGORY_MANAGER_NAME_PLACEHOLDER
} from '../ui-texts';
import { CATEGORY_GENERAL, FILTER_ALL } from '../constants';


const getRandomColor = () => {
  const r = Math.floor(Math.random() * 56 + 200).toString(16);
  const g = Math.floor(Math.random() * 56 + 200).toString(16);
  const b = Math.floor(Math.random() * 56 + 200).toString(16);

  return `#${r}${g}${b}`;
};
const CategoryManager = ({ categories, onAdd, onDelete, onUpdateColor, selectedFilter, onFilter }) => {

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(getRandomColor());
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmedName = newName.trim();

    if (!trimmedName) {
      setError(CATEGORY_MANAGER_ERROR_EMPTY);
      return;
    }

    const isDuplicate = categories.some(
      cat => cat.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setError(CATEGORY_MANAGER_ERROR_DUPLICATE(trimmedName));
      return;
    }

    onAdd(trimmedName, newColor, newColor);
    setNewName('');
    setNewColor(getRandomColor());
  };

  return (
    <S.ManagerContainer style={{ position: 'relative' }}>
    
      <ValidationTooltip message={error} onClear={() => setError('')} />

      <S.CategoryList>
        {categories.map(cat => {
          const isSelected = selectedFilter === cat.name;
          const isDimmed = selectedFilter !== FILTER_ALL && !isSelected;

          return (
            <S.Tag
              key={cat.name}
              $color={cat.color}
              $borderColor={cat.borderColor}
              $isSelected={isSelected}
              $isDimmed={isDimmed}
              onClick={() => onFilter(cat.name)}
              tabIndex="0"
              onKeyDown={(e) => e.key === 'Enter' && onFilter(cat.name)}
            >
              <S.IconContainer>
                <Palette size={16} color="#64748b" />
                <S.ColorCircle
                  type="color"
                  value={cat.color}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdateColor(cat.name, e.target.value);
                  }}
                />
              </S.IconContainer>
              <span>{cat.name}</span>
              {cat.name !== CATEGORY_GENERAL && (
                <S.DeleteIcon onClick={(e) => {
                  e.stopPropagation();
                  onDelete(cat.name);
                }}>
                  <X size={14} />
                </S.DeleteIcon>
              )}
            </S.Tag>
          );
        })}
      </S.CategoryList>

      <S.AddForm onSubmit={handleSubmit}>
        <S.TinyInput
          $size="small"
          placeholder={CATEGORY_MANAGER_NAME_PLACEHOLDER}
          value={newName}
          onChange={(e) => {
            if (error) setError('');
            setNewName(e.target.value);
          }}
    
        />
        <S.ColorInput
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
        />
        <S.IconButton type="submit">
          <Plus size={20} />
        </S.IconButton>
      </S.AddForm>
    </S.ManagerContainer>
  );
};

export default CategoryManager;