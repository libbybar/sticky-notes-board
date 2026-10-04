import React, { useEffect, useRef, useState } from 'react';
import * as S from '../style/CategoryManager.styles';
import { ColorPaletteIcon, LabelAddIcon, NoteDeleteIcon, CheckIcon } from '../assets/icons';
import ValidationTooltip from './ValidationTooltip';
import {
  CATEGORY_MANAGER_ERROR_EMPTY,
  CATEGORY_MANAGER_ERROR_DUPLICATE,
  CATEGORY_MANAGER_NAME_PLACEHOLDER,
  CATEGORY_MANAGER_DELETE_LABEL,
  CATEGORY_MANAGER_COLOR_LABEL,
  CATEGORY_MANAGER_ADD_LABEL,
  CATEGORY_MANAGER_NEW_COLOR_LABEL,
  CATEGORY_COLOR_NAME_YELLOW,
  CATEGORY_COLOR_NAME_PINK,
  CATEGORY_COLOR_NAME_GREEN,
  CATEGORY_COLOR_NAME_BLUE,
  CATEGORY_COLOR_NAME_PURPLE,
  CATEGORY_COLOR_NAME_ORANGE,
  CATEGORY_COLOR_NAME_CORAL
} from '../ui-texts';
import { CATEGORY_GENERAL, FILTER_ALL } from '../constants';
import { DEFAULT_COLOR } from '../style/style-constants';

// The native <input type="color"> is unreliable on touch devices (reported: every
// pick snaps back to black), so touch screens get this fixed pastel palette instead
// (see the `@media (pointer: coarse)` rules in CategoryManager.styles.js that swap
// the two). Desktop keeps the native picker, which works fine there.
const CATEGORY_COLOR_PALETTE = [
  { color: DEFAULT_COLOR, name: CATEGORY_COLOR_NAME_YELLOW },
  { color: '#fbcfe8', name: CATEGORY_COLOR_NAME_PINK },
  { color: '#bbf7d0', name: CATEGORY_COLOR_NAME_GREEN },
  { color: '#bfdbfe', name: CATEGORY_COLOR_NAME_BLUE },
  { color: '#ddd6fe', name: CATEGORY_COLOR_NAME_PURPLE },
  { color: '#fed7aa', name: CATEGORY_COLOR_NAME_ORANGE },
  { color: '#fecaca', name: CATEGORY_COLOR_NAME_CORAL }
];

const getRandomPaletteColor = () =>
  CATEGORY_COLOR_PALETTE[Math.floor(Math.random() * CATEGORY_COLOR_PALETTE.length)].color;

// Shared by the inline swatch row (new category) and the popover panel (existing
// category): one button per palette color, marked selected with both a ring and a
// checkmark icon so the state isn't conveyed by color alone.
const ColorSwatches = ({ value, onChange }) => (
  <>
    {CATEGORY_COLOR_PALETTE.map(({ color, name }) => {
      const isSelected = value?.toLowerCase() === color.toLowerCase();
      return (
        <S.ColorSwatchButton
          key={color}
          type="button"
          $color={color}
          $isSelected={isSelected}
          aria-pressed={isSelected}
          aria-label={name}
          onClick={() => onChange(color)}
        >
          {isSelected && <CheckIcon width={10} height={10} aria-hidden="true" />}
        </S.ColorSwatchButton>
      );
    })}
  </>
);

// The touch-only replacement for an existing category's color control: a small
// trigger that discloses the palette, closing on an outside click, Escape (with
// focus returned to the trigger) or a color pick. `onOpenChange` lets the parent
// raise this category's own tag above its siblings while the panel is open (see
// the z-index note on Tag in CategoryManager.styles.js for why that's needed).
const CategoryColorPicker = ({ label, value, onChange, onOpenChange }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);

  const close = () => {
    setOpen(false);
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    const closeIfOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) close();
    };
    const closeOnEscape = (e) => {
      if (e.key !== 'Escape') return;
      close();
      triggerRef.current?.focus();
    };
    document.addEventListener('mousedown', closeIfOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeIfOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <S.ColorPickerWrapper ref={wrapperRef}>
      <S.ColorTriggerButton
        type="button"
        ref={triggerRef}
        aria-expanded={open}
        aria-label={label}
        onClick={(e) => {
          e.stopPropagation();
          const next = !open;
          setOpen(next);
          onOpenChange(next);
        }}
      >
        <ColorPaletteIcon width={16} height={16} color="#64748b" aria-hidden="true" />
      </S.ColorTriggerButton>
      {open && (
        <S.ColorPopoverPanel role="group" aria-label={label} onClick={(e) => e.stopPropagation()}>
          <ColorSwatches
            value={value}
            onChange={(color) => {
              onChange(color);
              close();
              triggerRef.current?.focus();
            }}
          />
        </S.ColorPopoverPanel>
      )}
    </S.ColorPickerWrapper>
  );
};
const CategoryManager = ({ categories, onAdd, onDelete, onUpdateColor, selectedFilter, onFilter }) => {

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(getRandomPaletteColor());
  const [error, setError] = useState('');
  const [openColorPickerFor, setOpenColorPickerFor] = useState(null);

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

    onAdd(trimmedName, newColor);
    setNewName('');
    setNewColor(getRandomPaletteColor());
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
              $isColorPickerOpen={openColorPickerFor === cat.name}
            >
              <S.IconContainer>
                <S.DesktopColorIcon>
                  <ColorPaletteIcon width={16} height={16} color="#64748b" aria-hidden="true" />
                </S.DesktopColorIcon>
                <S.ColorCircle
                  type="color"
                  aria-label={CATEGORY_MANAGER_COLOR_LABEL(cat.name)}
                  value={cat.color}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdateColor(cat.name, e.target.value);
                  }}
                />
                <CategoryColorPicker
                  label={CATEGORY_MANAGER_COLOR_LABEL(cat.name)}
                  value={cat.color}
                  onChange={(color) => onUpdateColor(cat.name, color)}
                  onOpenChange={(isOpen) =>
                    setOpenColorPickerFor(prev => isOpen ? cat.name : (prev === cat.name ? null : prev))
                  }
                />
              </S.IconContainer>
              <S.TagName type="button" aria-pressed={isSelected} onClick={() => onFilter(cat.name)}>{cat.name}</S.TagName>
              {cat.name !== CATEGORY_GENERAL && (
                <S.DeleteIcon aria-label={CATEGORY_MANAGER_DELETE_LABEL(cat.name)} onClick={(e) => {
                  e.stopPropagation();
                  onDelete(cat.name);
                }}>
                  <NoteDeleteIcon width={14} height={14} aria-hidden="true" />
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
          aria-label={CATEGORY_MANAGER_NAME_PLACEHOLDER}
          value={newName}
          onChange={(e) => {
            if (error) setError('');
            setNewName(e.target.value);
          }}
    
        />
        <S.ColorInput
          type="color"
          aria-label={CATEGORY_MANAGER_NEW_COLOR_LABEL}
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
        />
        <S.MobileColorPalette>
          <S.ColorSwatchRow role="group" aria-label={CATEGORY_MANAGER_NEW_COLOR_LABEL}>
            <ColorSwatches value={newColor} onChange={setNewColor} />
          </S.ColorSwatchRow>
        </S.MobileColorPalette>
        <S.IconButton type="submit" aria-label={CATEGORY_MANAGER_ADD_LABEL}>
          <LabelAddIcon width={20} height={20} aria-hidden="true" />
        </S.IconButton>
      </S.AddForm>
    </S.ManagerContainer>
  );
};

export default CategoryManager;