import React from 'react';
import * as S from '../style/TaskFilters.styles';
import {
  NoteUrgentIcon as UrgentIcon,
  TaskInProgressIcon as InProgressIcon,
  TaskOverdueIcon as OverdueIcon,
  TaskCompleteIcon as CompleteIcon,
  MultiSelectIcon
} from '../assets/icons';
import { STATUS_IN_PROGRESS, STATUS_COMPLETED } from '../constants';
import {
  TODO_APP_SEARCH_PLACEHOLDER,
  TODO_APP_FILTER_IMPORTANT_LABEL,
  TODO_APP_FILTER_IN_PROGRESS_LABEL,
  TODO_APP_FILTER_OVERDUE_LABEL,
  TODO_APP_FILTER_COMPLETED_LABEL,
  TODO_APP_SELECTION_MODE_ON_LABEL,
  TODO_APP_SELECTION_MODE_OFF_LABEL
} from '../ui-texts';

const TaskFilters = ({
  searchTerm,
  onSearchChange,
  activeStatusFilter,
  onSetActiveStatusFilter,
  isSelectionMode,
  onToggleSelectionMode
}) => {
  const toggleStatusFilter = (value) => {
    onSetActiveStatusFilter(prev => prev === value ? 'all' : value);
  };

  return (
    <S.ControlBar>
      <S.SearchInput
        placeholder={TODO_APP_SEARCH_PLACEHOLDER}
        aria-label={TODO_APP_SEARCH_PLACEHOLDER}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <S.FilterButton
        $active={activeStatusFilter === 'important'}
        aria-pressed={activeStatusFilter === 'important'}
        onClick={() => toggleStatusFilter('important')}
      >
        <UrgentIcon width={16} height={16} />{TODO_APP_FILTER_IMPORTANT_LABEL}
      </S.FilterButton>
      <S.FilterButton
        $active={activeStatusFilter === STATUS_IN_PROGRESS}
        aria-pressed={activeStatusFilter === STATUS_IN_PROGRESS}
        onClick={() => toggleStatusFilter(STATUS_IN_PROGRESS)}
      >
        <InProgressIcon width={16} height={16} />{TODO_APP_FILTER_IN_PROGRESS_LABEL}
      </S.FilterButton>
      <S.FilterButton
        $active={activeStatusFilter === 'overdue'}
        aria-pressed={activeStatusFilter === 'overdue'}
        onClick={() => toggleStatusFilter('overdue')}
      >
        <OverdueIcon width={16} height={16} />{TODO_APP_FILTER_OVERDUE_LABEL}
      </S.FilterButton>
      <S.FilterButton
        $active={activeStatusFilter === STATUS_COMPLETED}
        aria-pressed={activeStatusFilter === STATUS_COMPLETED}
        onClick={() => toggleStatusFilter(STATUS_COMPLETED)}
      >
        <CompleteIcon width={16} height={16} />{TODO_APP_FILTER_COMPLETED_LABEL}
      </S.FilterButton>
      <S.FilterButton $active={isSelectionMode} onClick={onToggleSelectionMode}>
        <MultiSelectIcon width={16} height={16} />
        {isSelectionMode ? TODO_APP_SELECTION_MODE_ON_LABEL : TODO_APP_SELECTION_MODE_OFF_LABEL}
      </S.FilterButton>
    </S.ControlBar>
  );
};

export default TaskFilters;
