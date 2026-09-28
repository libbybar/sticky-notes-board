import { useState } from 'react';
import { useTodoManager } from './Hooks/useTodoManager';
import styled from 'styled-components';
import Header from './components/Header';
import TaskInput from './components/TaskInput';
import StickyNote from './components/StickyNote';
import Login from './components/Login';
import CategoryManager from './components/CategoryManager';
import ConfirmationModal from './components/ConfirmationModal';
import EmptyState from './components/EmptyState';
import { touchTarget } from './style/SharedStyles';
import myBackgroundImage from './assets/my-background.jpeg';
import {
  NoteUrgentIcon as UrgentIcon,
  TaskInProgressIcon as InProgressIcon,
  TaskOverdueIcon as OverdueIcon,
  TaskCompleteIcon as CompleteIcon,
  MultiSelectIcon,
  EmptyBoardIcon,
  ClearAllIcon
} from './assets/icons';
import { useBulkSelection } from './Hooks/useBulkSelection';
import { CATEGORY_GENERAL, FILTER_ALL } from './constants';
import {
  CANCEL_LABEL,
  BULK_DELETE_LABEL,
  TODO_APP_CLEAR_BOARD_TOOLTIP,
  TODO_APP_DELETE_TASK_TITLE,
  TODO_APP_DELETE_TASK_MESSAGE_PREFIX,
  TODO_APP_DELETE_CATEGORY_TITLE,
  TODO_APP_DELETE_CATEGORY_CONFIRM_PREFIX,
  TODO_APP_DELETE_CATEGORY_KEPT_NOTICE,
  TODO_APP_RESET_TITLE,
  TODO_APP_RESET_MESSAGE,
  TODO_APP_RESET_CONFIRM_TEXT,
  TODO_APP_BULK_DELETE_MESSAGE,
  TODO_APP_SEARCH_PLACEHOLDER,
  TODO_APP_FILTER_COMPLETED_LABEL,
  TODO_APP_FILTER_IMPORTANT_LABEL,
  TODO_APP_FILTER_IN_PROGRESS_LABEL,
  TODO_APP_FILTER_OVERDUE_LABEL,
  TODO_APP_SELECTION_MODE_ON_LABEL,
  TODO_APP_SELECTION_MODE_OFF_LABEL,
  TODO_APP_BULK_BANNER_SELECTED_COUNT,
  TODO_APP_CHANGE_CATEGORY_OPTION,
  TODO_APP_EMPTY_BOARD_TITLE,
  TODO_APP_EMPTY_BOARD_MESSAGE,
  TODO_APP_NO_RESULTS_TITLE,
  TODO_APP_NO_RESULTS_MESSAGE,
  TODO_APP_CLEAR_FILTERS_LABEL
} from './ui-texts';


const AppContainer = styled.div`
  min-height: 100vh;  padding: 2rem;
  background: radial-gradient(circle at top right, #fdf2ff, #f0f4ff, #fff5f5);
  direction: rtl;

  @media (max-width: 600px) {
    padding: 2.5rem 1rem 1rem;
  }
`;
const ControlBar = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  align-items: center;
  flex-wrap: wrap;
`;
const BulkActionBanner = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  padding: 1rem 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1.2rem;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  span {
    font-weight: 600;
    color: #1e293b;
    font-family: 'Assistant', sans-serif;
  }

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }
`;
const CategorySelect = styled.select`
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.1);
  font-family: 'Assistant', sans-serif;
  background: white;
  cursor: pointer;
  outline: none;
  color: #1e293b;

  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;
const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  background: ${props => props.$variant === 'danger' ? '#fee2e2' : '#f1f5f9'};
  color: ${props => props.$variant === 'danger' ? '#ef4444' : '#475569'};

  &:hover {
    background: ${props => props.$variant === 'danger' ? '#ef4444' : '#e2e8f0'};
    color: ${props => props.$variant === 'danger' ? 'white' : '#1e293b'};
  }
`;
const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(0,0,0,0.1);
  outline: none;
  flex: 1;
  min-width: 200px;
  font-family: 'Assistant', sans-serif;

  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;
const FilterButton = styled.button`
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  border: 1px solid ${props => props.$active ? '#3b82f6' : 'rgba(0,0,0,0.1)'};
  background: ${props => props.$active ? '#3b82f6' : 'white'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  transition: all 0.2s;

  @media (pointer: coarse) {
    min-height: 40px;
  }
`;
const NotesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 3rem 2rem;
  position: relative;

  @media (max-width: 600px) {
    gap: 1rem;
    margin: 1rem auto;
    padding: 2rem 0.75rem;
  }

  background-color: #bc8f6f;
  background-image: 
   url(${myBackgroundImage}),
    radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 100%);
border: 12px solid #5d4037;
  border-radius: 8px;

  @media (max-width: 600px) {
    border-width: 8px;
  }
  box-shadow: 
    inset 0 0 30px rgba(0,0,0,0.3),
    0 10px 30px rgba(0,0,0,0.15);

    filter: ${props => props.$isSelectionMode ? 'brightness(0.9) contrast(1.1)' : 'none'};
  transition: all 0.4s ease;

`;
const ClearBoardButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #64748b;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  z-index: 100;
  ${touchTarget(8)}

  &:hover {
    background: #fee2e2;
    color: #ef4444;
    border-color: #fecaca;
  }

  &:after {
    content: '${TODO_APP_CLEAR_BOARD_TOOLTIP}';
    position: absolute;
    right: 30px;
    white-space: nowrap;
    background: #334155;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }

  &:hover:after {
    opacity: 1;
  }
`;

const TodoApp = () => {

    const {
        userName,
        categories,
        visibleTasks,
        hasTasks,
        searchTerm,
        selectedFilter,
        activeStatusFilter,

        setUserName,
        setCategories,
        setSearchTerm,
        setSelectedFilter,
        setActiveStatusFilter,

        addTask,
        renameTask,
        updateTaskContent,
        changeTaskDeadline,
        moveToCategory,
        toggleImportant,
        convertToChecklist,
        convertToText,
        addChecklistItem,
        updateChecklistItemText,
        toggleChecklistItem,
        deleteChecklistItem,
        toggleTaskStatus,
        confirmDeleteTask,
        deleteMultipleTasks,
        updateMultipleTasksCategory,
        moveCategoryTasks,
        clearFilters,
        clearAppData
    } = useTodoManager();

    const {
        selectedIds,
        isSelectionMode,
        toggleSelection,
        toggleMode: toggleSelectionMode,
        clearSelection
    } = useBulkSelection();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const requestCategoryDelete = (catName) => {
    setCategoryToDelete(catName);
    setIsCategoryDeleteModalOpen(true);
};
const confirmCategoryDelete = () => {
    if (categoryToDelete) {
        setCategories(categories.filter(c => c.name !== categoryToDelete));
        moveCategoryTasks(categoryToDelete, CATEGORY_GENERAL);
        if (selectedFilter === categoryToDelete) {
            setSelectedFilter(FILTER_ALL);
        }
        setIsCategoryDeleteModalOpen(false);
        setCategoryToDelete(null);
    }
};
    if (!userName) {
        return <Login onLogin={setUserName} />;
    }

    const selectedVisibleIds = visibleTasks
        .filter(task => selectedIds.includes(task.id))
        .map(task => task.id);

    const requestDelete = (task) => {
        setTaskToDelete(task);
        setIsDeleteModalOpen(true);
    };
    const confirmDelete = () => {
        if (taskToDelete) {
            confirmDeleteTask(taskToDelete.id);
            setIsDeleteModalOpen(false);
            setTaskToDelete(null);
        }
    };
    const handleBulkDelete = () => {
        deleteMultipleTasks(selectedVisibleIds);
        clearSelection();
        setIsBulkDeleteModalOpen(false);
    };
    const handleConfirmReset = () => {
        clearAppData();
        setIsResetModalOpen(false);
        window.location.reload();
    };
    const updateSelectedTasksCategory = (newCategory) => {
        if (!newCategory || selectedVisibleIds.length === 0) return;
        updateMultipleTasksCategory(selectedVisibleIds, newCategory);
        clearSelection();
    };

    return (
        <AppContainer $isSelectionMode={isSelectionMode}>
            <ClearBoardButton aria-label={TODO_APP_CLEAR_BOARD_TOOLTIP} onClick={() => setIsResetModalOpen(true)}>
                <ClearAllIcon width={14} height={14} aria-hidden="true" />
            </ClearBoardButton>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title={TODO_APP_DELETE_TASK_TITLE}
                message={<>{TODO_APP_DELETE_TASK_MESSAGE_PREFIX}<br /><strong>"{taskToDelete?.title || taskToDelete?.text}"</strong></>}
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
            <ConfirmationModal
                isOpen={isCategoryDeleteModalOpen}
                title={TODO_APP_DELETE_CATEGORY_TITLE}
                message={<>{TODO_APP_DELETE_CATEGORY_CONFIRM_PREFIX}<strong>"{categoryToDelete}"</strong>?<br />{TODO_APP_DELETE_CATEGORY_KEPT_NOTICE(CATEGORY_GENERAL)}</>}
                onConfirm={confirmCategoryDelete}
                onCancel={() => setIsCategoryDeleteModalOpen(false)}
            />
            <ConfirmationModal
                isOpen={isResetModalOpen}
                title={TODO_APP_RESET_TITLE}
                message={TODO_APP_RESET_MESSAGE}
                confirmText={TODO_APP_RESET_CONFIRM_TEXT}
                onConfirm={handleConfirmReset}
                onCancel={() => setIsResetModalOpen(false)}
            />
            <ConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                title={BULK_DELETE_LABEL}
                message={TODO_APP_BULK_DELETE_MESSAGE(selectedVisibleIds.length)}
                onConfirm={handleBulkDelete}
                onCancel={() => setIsBulkDeleteModalOpen(false)}
            />

            <Header userName={userName} />
            <CategoryManager
                categories={categories}
                onAdd={(name, color) => setCategories([...categories, { name, color, borderColor: color }])}
                onDelete={requestCategoryDelete}
                onUpdateColor={(name, color) => setCategories(categories.map(c => c.name === name ? { ...c, color, borderColor: color } : c))}
                selectedFilter={selectedFilter}
                onFilter={(cat) => setSelectedFilter(prev => prev === cat ? FILTER_ALL : cat)}
            />
            <TaskInput onAdd={addTask} categories={categories} />

            <ControlBar>
                <SearchInput
                    placeholder={TODO_APP_SEARCH_PLACEHOLDER}
                    aria-label={TODO_APP_SEARCH_PLACEHOLDER}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FilterButton $active={activeStatusFilter === 'important'}
                    aria-pressed={activeStatusFilter === 'important'}
                    onClick={() => setActiveStatusFilter(prev => prev === 'important' ? 'all' : 'important')}>
                    <UrgentIcon width={16} height={16} />{TODO_APP_FILTER_IMPORTANT_LABEL}
                </FilterButton>
                <FilterButton $active={activeStatusFilter === 'in-progress'}
                    aria-pressed={activeStatusFilter === 'in-progress'}
                    onClick={() => setActiveStatusFilter(prev => prev === 'in-progress' ? 'all' : 'in-progress')}>
                    <InProgressIcon width={16} height={16} />{TODO_APP_FILTER_IN_PROGRESS_LABEL}
                </FilterButton>
                <FilterButton $active={activeStatusFilter === 'overdue'}
                    aria-pressed={activeStatusFilter === 'overdue'}
                    onClick={() => setActiveStatusFilter(prev => prev === 'overdue' ? 'all' : 'overdue')}>
                    <OverdueIcon width={16} height={16} />{TODO_APP_FILTER_OVERDUE_LABEL}
                </FilterButton>
                <FilterButton $active={activeStatusFilter === 'completed'}
                    aria-pressed={activeStatusFilter === 'completed'}
                    onClick={() => setActiveStatusFilter(prev => prev === 'completed' ? 'all' : 'completed')}>
                    <CompleteIcon width={16} height={16} />{TODO_APP_FILTER_COMPLETED_LABEL}
                </FilterButton>
                <FilterButton $active={isSelectionMode}
                    onClick={toggleSelectionMode}>
                    <MultiSelectIcon width={16} height={16} />
                    {isSelectionMode ? TODO_APP_SELECTION_MODE_ON_LABEL : TODO_APP_SELECTION_MODE_OFF_LABEL}
                </FilterButton>
            </ControlBar>

            {selectedVisibleIds.length > 0 && (
                <BulkActionBanner>
                    <span>{TODO_APP_BULK_BANNER_SELECTED_COUNT(selectedVisibleIds.length)}</span>
                    <ActionButton $variant="danger" onClick={() => setIsBulkDeleteModalOpen(true)}>{BULK_DELETE_LABEL}</ActionButton>
                    <CategorySelect aria-label={TODO_APP_CHANGE_CATEGORY_OPTION} onChange={(e) => updateSelectedTasksCategory(e.target.value)}>
                        <option value="">{TODO_APP_CHANGE_CATEGORY_OPTION}</option>
                        {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                    </CategorySelect>
                    <ActionButton onClick={clearSelection}>{CANCEL_LABEL}</ActionButton>
                </BulkActionBanner>
            )}

            <NotesGrid $isSelectionMode={isSelectionMode}>
                {visibleTasks.length === 0 && (hasTasks
                    ? <EmptyState
                        title={TODO_APP_NO_RESULTS_TITLE}
                        message={TODO_APP_NO_RESULTS_MESSAGE}
                        actionLabel={TODO_APP_CLEAR_FILTERS_LABEL}
                        onAction={clearFilters}
                    />
                    : <EmptyState
                        icon={<EmptyBoardIcon width={96} height={72} aria-hidden="true" />}
                        title={TODO_APP_EMPTY_BOARD_TITLE}
                        message={TODO_APP_EMPTY_BOARD_MESSAGE}
                    />
                )}
                {visibleTasks.map(task => (
                    <StickyNote
                        key={task.id}
                        task={task}
                        isSelected={selectedIds.includes(task.id)}
                        isSelectionMode={isSelectionMode}
                        onToggleSelect={() => toggleSelection(task.id)}
                        categories={categories}
                        categoryInfo={categories.find(c => c.name === task.category)}
                        onDelete={() => requestDelete(task)}
                        onUpdateStatus={() => toggleTaskStatus(task.id)}
                        onUpdateText={updateTaskContent}
                        onUpdateTitle={renameTask}
                        onUpdateDeadline={changeTaskDeadline}
                        onUpdateCategory={moveToCategory}
                        onToggleImportant={toggleImportant}
                        onConvertToChecklist={convertToChecklist}
                        onConvertToText={convertToText}
                        onAddChecklistItem={addChecklistItem}
                        onUpdateChecklistItemText={updateChecklistItemText}
                        onToggleChecklistItem={toggleChecklistItem}
                        onDeleteChecklistItem={deleteChecklistItem}
                    />
                ))}
            </NotesGrid>
        </AppContainer>
    );
};

export default TodoApp;