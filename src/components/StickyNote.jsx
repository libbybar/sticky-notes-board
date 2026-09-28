import React from 'react';
import * as S from '../style/StickyNote.styles';
import {
  PinRedIcon,
  PinBlueIcon,
  NoteDeleteIcon as DeleteIcon,
  TaskInProgressIcon as InProgressIcon,
  TaskCompleteIcon as CompleteIcon,
  TaskIcon,
  CalendarIcon,
  CheckIcon
} from '../assets/icons';
import { DEFAULT_COLOR, DEFAULT_BORDER } from '../style/style-constants';
import { CATEGORY_GENERAL } from '../constants';
import {
  STICKY_NOTE_DELETE_TITLE,
  STICKY_NOTE_TITLE_PLACEHOLDER,
  STICKY_NOTE_TEXT_LABEL,
  STICKY_NOTE_DATE_LABEL,
  STICKY_NOTE_CATEGORY_LABEL,
  STICKY_NOTE_SELECT_LABEL,
  STICKY_NOTE_MARK_IMPORTANT,
  STICKY_NOTE_UNMARK_IMPORTANT,
  STICKY_NOTE_NO_DEADLINE_LABEL,
  STICKY_NOTE_OVERDUE_BADGE,
  STICKY_NOTE_CREATED_AT,
  STICKY_NOTE_CHECK_TITLE_PENDING,
  STICKY_NOTE_CHECK_TITLE_IN_PROGRESS,
  STICKY_NOTE_CHECK_TITLE_COMPLETED
} from '../ui-texts';

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
  const importantLabel = isImportant ? STICKY_NOTE_UNMARK_IMPORTANT : STICKY_NOTE_MARK_IMPORTANT;
  const deadlineValue = deadline ? new Date(deadline).toISOString().split('T')[0] : '';
  const formattedDeadline = deadline ? new Date(deadline).toLocaleDateString('he-IL') : '';

  return (
    <S.NoteContainer
      $bgColor={bgColor}
      $borderColor={borderColor}
      $rotation={rotation}
      $isSelected={isSelected}
      $isSelectionMode={isSelectionMode}
      $isImportant={!!isImportant}
    >
      <S.PinWrapper $status={task.status} $rotation={task.pinRotation}>
        {task.status === 'in-progress'
          ? <PinBlueIcon width={30} height={30} aria-hidden="true" />
          : <PinRedIcon width={30} height={30} aria-hidden="true" />}
      </S.PinWrapper>

      <S.ImportantCorner
        type="button"
        $isImportant={!!isImportant}
        aria-label={importantLabel}
        data-tooltip={importantLabel}
        onClick={() => onToggleImportant && onToggleImportant(id)}
      >
        <S.CornerShape $isImportant={!!isImportant} $bgColor={bgColor} />
      </S.ImportantCorner>

      <S.NoteHeaderArea>
        <S.TopRow>
          <S.HeaderActions>
            {isSelectionMode && (
              <S.CustomSelectionCircle
                type="button"
                aria-label={STICKY_NOTE_SELECT_LABEL}
                aria-pressed={!!isSelected}
                $isSelected={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect();
                }}
              >
                {isSelected && <CheckIcon width={11} height={11} color="white" aria-hidden="true" />}
              </S.CustomSelectionCircle>
            )}
            <S.CategoryTag
              aria-label={STICKY_NOTE_CATEGORY_LABEL}
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
            <DeleteIcon width={14} height={14} aria-hidden="true" />
          </S.DeleteBtn>
        </S.TopRow>

        <S.HeaderRow>
          <S.TitleInput
            role="textbox"
            aria-label={STICKY_NOTE_TITLE_PLACEHOLDER}
            aria-multiline="false"
            aria-readonly={completed}
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
          role="textbox"
          aria-label={STICKY_NOTE_TEXT_LABEL}
          aria-multiline="true"
          aria-readonly={completed}
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
            <CalendarIcon width={11} height={11} aria-hidden="true" />
            <S.DateText
              type="date"
              aria-label={STICKY_NOTE_DATE_LABEL}
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
            {task.status === 'in-progress'
              ? <InProgressIcon width={18} height={18} aria-hidden="true" />
              : task.status === 'completed'
                ? <CompleteIcon width={18} height={18} aria-hidden="true" />
                : <TaskIcon width={18} height={18} aria-hidden="true" />}
          </S.CheckButton>
        </S.ActionButtons>
      </S.Footer>
    </S.NoteContainer>
  );
};

export default StickyNote;