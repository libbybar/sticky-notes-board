import React from 'react';
import * as S from './StickyNote.styles';
import { Check, Trash2, Pin, Star } from 'lucide-react';
import { DEFAULT_COLOR, DEFAULT_BORDER, CATEGORY_GENERAL } from '../constants';
import {
  STICKY_NOTE_DELETE_TITLE,
  STICKY_NOTE_MARK_IMPORTANT,
  STICKY_NOTE_UNMARK_IMPORTANT,
  STICKY_NOTE_NO_DEADLINE_LABEL,
  STICKY_NOTE_OVERDUE_BADGE,
  STICKY_NOTE_CREATED_AT,
  STICKY_NOTE_CHECK_TITLE_PENDING,
  STICKY_NOTE_CHECK_TITLE_IN_PROGRESS,
  STICKY_NOTE_CHECK_TITLE_COMPLETED
} from '../strings';

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
  isSelected,
  isSelectionMode,
  onToggleSelect }) => {

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
    isImportant
  } = task;

  const isOverdue = deadline &&  // יש כפילות, כי אצל האמא יש פונקצית עזר שבודקת את זה, אבל אני בוחרת להשאיר כאן כי זאת הגנה נדרשת בעיניי גם פה 
    new Date(deadline) < new Date().setHours(0, 0, 0, 0) &&
    !completed;

 const bgColor = categoryInfo?.color ?? DEFAULT_COLOR;
  const borderColor = categoryInfo?.borderColor ?? DEFAULT_BORDER;

  const handleUpdateStatus = (e) => { //הגנה - עוצר את הלחיצה על הפתק כאן ומונע ביעבוע של האירוע לאמא
    e.stopPropagation();
    if (typeof onUpdateStatus === 'function') {
      onUpdateStatus(task.id);
    }
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    if (typeof onDelete === 'function') onDelete(id);
  };
  const deadlineValue = deadline ? new Date(deadline).toISOString().split('T')[0] : '';
  const formattedDeadline = deadline ? new Date(deadline).toLocaleDateString('he-IL') : '';

  return (
    <S.NoteContainer
      $bgColor={bgColor}
      $borderColor={borderColor}
      $rotation={rotation}
      $isSelected={isSelected}
      $isSelectionMode={isSelectionMode}
    >
      <S.PinWrapper $status={task.status} $rotation={task.pinRotation}>
        <Pin size={24} fill="currentColor" />
      </S.PinWrapper>

      <S.NoteHeaderArea>
        <S.TopRow>
          <S.HeaderActions>
            {isSelectionMode && (
              <S.CustomSelectionCircle
                $isSelected={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect();
                }}
              />
            )}
            <S.CategoryTag
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
          <S.DeleteBtn onClick={handleDelete} title={STICKY_NOTE_DELETE_TITLE}>
            <Trash2 size={14} />
          </S.DeleteBtn>
        </S.TopRow>

        <S.HeaderRow>
          <S.StarButton
            $isImportant={isImportant}
            onClick={() => onToggleImportant && onToggleImportant(id)}
            title={isImportant ? STICKY_NOTE_UNMARK_IMPORTANT : STICKY_NOTE_MARK_IMPORTANT}
          >
            <Star size={18} fill={isImportant ? "currentColor" : "none"} />
          </S.StarButton>
          <S.TitleInput
            contentEditable={!completed}
            suppressContentEditableWarning={true}
            $isCompleted={completed}
            onBlur={(e) => onUpdateTitle && onUpdateTitle(id, e.target.innerText)}
          >
            {title}
          </S.TitleInput>
        </S.HeaderRow>
      </S.NoteHeaderArea>

      <S.ContentArea dir="rtl">
        <S.TaskText
          $isCompleted={completed}
          contentEditable={!completed}
          suppressContentEditableWarning={true}
          onBlur={(e) => onUpdateText && onUpdateText(id, e.target.innerText)}
        >
          {text}
        </S.TaskText>
      </S.ContentArea>

      <S.Footer>
        <S.FooterInfo>
          <S.DeadlineRow>
            <span style={{ fontSize: '0.63rem' }}>📅</span>
            <S.DateText
              type="date"
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
            $status={task.status || 'pending'}
            onClick={handleUpdateStatus}
            title={
              task.status === 'pending' ? STICKY_NOTE_CHECK_TITLE_PENDING :
                task.status === 'in-progress' ? STICKY_NOTE_CHECK_TITLE_IN_PROGRESS :
                  STICKY_NOTE_CHECK_TITLE_COMPLETED
            }
          >
            <Check size={18} strokeWidth={3} />
          </S.CheckButton>
        </S.ActionButtons>
      </S.Footer>
    </S.NoteContainer>
  );
};

export default StickyNote;