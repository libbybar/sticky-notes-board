import { useState } from 'react';
import { useTodoManager } from './Hooks/useTodoManager';
import * as S from './style/TodoApp.styles';
import Header from './components/Header';
import CreateNote from './components/CreateNote';
import TaskFilters from './components/TaskFilters';
import BulkActionsBar from './components/BulkActionsBar';
import StickyNote from './components/StickyNote';
import Login from './components/Login';
import CategoryManager from './components/CategoryManager';
import ConfirmationModal from './components/ConfirmationModal';
import EmptyState from './components/EmptyState';
import { ClearAllIcon, EmptyBoardIcon } from './assets/icons';
import { useBulkSelection } from './Hooks/useBulkSelection';
import { CATEGORY_GENERAL, FILTER_ALL } from './constants';
import {
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
  TODO_APP_EMPTY_BOARD_TITLE,
  TODO_APP_EMPTY_BOARD_MESSAGE,
  TODO_APP_NO_RESULTS_TITLE,
  TODO_APP_NO_RESULTS_MESSAGE,
  TODO_APP_CLEAR_FILTERS_LABEL
} from './ui-texts';

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
        setSearchTerm,
        setSelectedFilter,
        setActiveStatusFilter,

        addTask,
        renameTask,
        updateTaskContent,
        changeTaskDeadline,
        updateTaskCategory,
        toggleImportant,
        convertToChecklist,
        convertToText,
        addChecklistItem,
        updateChecklistItemText,
        toggleChecklistItem,
        deleteChecklistItem,
        toggleTaskStatus,
        deleteTask,
        deleteMultipleTasks,
        updateMultipleTasksCategory,
        addCategory,
        updateCategoryColor,
        deleteCategory,
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
        deleteCategory(categoryToDelete);
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
            deleteTask(taskToDelete.id);
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
        <S.AppContainer $isSelectionMode={isSelectionMode}>
            <S.ClearBoardButton aria-label={TODO_APP_CLEAR_BOARD_TOOLTIP} onClick={() => setIsResetModalOpen(true)}>
                <ClearAllIcon width={14} height={14} aria-hidden="true" />
            </S.ClearBoardButton>

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
            <CreateNote onAdd={addTask} categories={categories} />
            <CategoryManager
                categories={categories}
                onAdd={addCategory}
                onDelete={requestCategoryDelete}
                onUpdateColor={updateCategoryColor}
                selectedFilter={selectedFilter}
                onFilter={(cat) => setSelectedFilter(prev => prev === cat ? FILTER_ALL : cat)}
            />

            <TaskFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                activeStatusFilter={activeStatusFilter}
                onSetActiveStatusFilter={setActiveStatusFilter}
                isSelectionMode={isSelectionMode}
                onToggleSelectionMode={toggleSelectionMode}
            />

            {selectedVisibleIds.length > 0 && (
                <BulkActionsBar
                    selectedCount={selectedVisibleIds.length}
                    categories={categories}
                    onBulkDelete={() => setIsBulkDeleteModalOpen(true)}
                    onChangeCategory={updateSelectedTasksCategory}
                    onCancel={clearSelection}
                />
            )}

            <S.NotesGrid $isSelectionMode={isSelectionMode}>
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
                        onUpdateCategory={updateTaskCategory}
                        onToggleImportant={toggleImportant}
                        onConvertToChecklist={convertToChecklist}
                        onConvertToText={convertToText}
                        onAddChecklistItem={addChecklistItem}
                        onUpdateChecklistItemText={updateChecklistItemText}
                        onToggleChecklistItem={toggleChecklistItem}
                        onDeleteChecklistItem={deleteChecklistItem}
                    />
                ))}
            </S.NotesGrid>
        </S.AppContainer>
    );
};

export default TodoApp;
