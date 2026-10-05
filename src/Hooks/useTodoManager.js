import { useState, useEffect } from 'react';
import { DEFAULT_COLOR, DEFAULT_BORDER } from '../style/style-constants';
import { CATEGORY_GENERAL, STATUS_PENDING, STATUS_IN_PROGRESS, STATUS_COMPLETED, FILTER_ALL } from '../constants';
import { TodoRepository } from '../services/TodoRepository';
import { isTaskOverdue } from '../utils/taskDeadline';

let checklistItemCounter = 0;
// Unique even when several items are created in the same millisecond (e.g. when splitting existing text on conversion)
const createChecklistItem = (text = '') => ({
    id: `${Date.now()}-${checklistItemCounter++}`,
    text,
    checked: false
});

// task.text is kept in sync with the checklist items on every change, so search, the delete
// dialog and converting back to a plain note always see current content rather than the
// stale text from before the conversion to a checklist.
const joinChecklistText = (checklistItems) => checklistItems.map(item => item.text).join('\n');

export const useTodoManager = () => {
    // Lazy initializer: without it, getAllData() (which reads and JSON.parses three
    // localStorage keys) would re-run on every render - including on every keystroke
    // in the search box - even though its result is only ever used once, for the
    // initial state below.
    const [initialData] = useState(() => TodoRepository.getAllData());

    const [userName, setUserName] = useState(initialData.userName);
    const [tasks, setTasks] = useState(initialData.tasks);
    const [categories, setCategories] = useState(initialData.categories);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState(FILTER_ALL);
    const [activeStatusFilter, setActiveStatusFilter] = useState('all');

    useEffect(() => {
        if (userName) {
            TodoRepository.saveTasks(tasks);
        }
    }, [tasks, userName]);

    useEffect(() => {
        if (userName) {
            TodoRepository.saveCategories(categories);
        }
    }, [categories, userName]);

    useEffect(() => {
        if (userName) {
            TodoRepository.saveUser(userName);
        }
    }, [userName]);

    const _updateTask = (id, updateFn) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, ...updateFn(t) } : t
        ));
    };
    const addTask = (taskData) => {
        const newTask = {
            isChecklist: false,
            checklistItems: [],
            ...taskData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            status: STATUS_PENDING,
            completed: false,
            rotation: Math.floor(Math.random() * 10) - 5
        };
        setTasks(prev => [newTask, ...prev]);
    };
    const renameTask = (id, title) => _updateTask(id, () => ({ title }));

    const updateTaskContent = (id, text) => _updateTask(id, () => ({ text }));

    const changeTaskDeadline = (id, deadline) => _updateTask(id, () => ({ deadline }));

    const updateTaskCategory = (id, category) => _updateTask(id, () => ({ category }));

    const toggleImportant = (id) => _updateTask(id, (t) => ({ isImportant: !t.isImportant }));

    const convertToChecklist = (id) => _updateTask(id, (task) => {
        const items = (task.text || '')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => createChecklistItem(line));
        const checklistItems = items.length > 0 ? items : [createChecklistItem('')];
        return {
            isChecklist: true,
            checklistItems,
            text: joinChecklistText(checklistItems)
        };
    });

    const convertToText = (id) => _updateTask(id, () => ({
        isChecklist: false,
        checklistItems: []
    }));

    const addChecklistItem = (id, afterIndex) => _updateTask(id, (task) => {
        const items = task.checklistItems || [];
        const newItem = createChecklistItem('');
        const nextItems = (afterIndex === undefined || afterIndex === null)
            ? [...items, newItem]
            : [...items.slice(0, afterIndex + 1), newItem, ...items.slice(afterIndex + 1)];
        return { checklistItems: nextItems, text: joinChecklistText(nextItems) };
    });

    const updateChecklistItemText = (id, itemId, text) => _updateTask(id, (task) => {
        const nextItems = (task.checklistItems || []).map(item =>
            item.id === itemId ? { ...item, text } : item
        );
        return { checklistItems: nextItems, text: joinChecklistText(nextItems) };
    });

    const toggleChecklistItem = (id, itemId) => _updateTask(id, (task) => ({
        checklistItems: (task.checklistItems || []).map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        )
    }));

    const deleteChecklistItem = (id, itemId) => _updateTask(id, (task) => {
        const nextItems = (task.checklistItems || []).filter(item => item.id !== itemId);
        return { checklistItems: nextItems, text: joinChecklistText(nextItems) };
    });

    const toggleTaskStatus = (id) => {
        _updateTask(id, (task) => {
            const nextStatus = {
                [STATUS_PENDING]: STATUS_IN_PROGRESS,
                [STATUS_IN_PROGRESS]: STATUS_COMPLETED,
                [STATUS_COMPLETED]: STATUS_PENDING
            }[task.status] || STATUS_IN_PROGRESS;

            return {
                status: nextStatus,
                completed: nextStatus === STATUS_COMPLETED
            };
        });
    };
    const deleteTask = (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };
    const deleteMultipleTasks = (ids) => {
        setTasks(prev => prev.filter(t => !ids.includes(t.id)));
    };
    const updateMultipleTasksCategory = (ids, newCategory) => {
        setTasks(prev => prev.map(t =>
            ids.includes(t.id) ? { ...t, category: newCategory } : t
        ));
    };
    const addCategory = (name, color) =>
        setCategories(prev => [...prev, { name, color, borderColor: color }]);

    const updateCategoryColor = (name, color) =>
        setCategories(prev => prev.map(category =>
            category.name === name ? { ...category, color, borderColor: color } : category
        ));

    const deleteCategory = (name) =>
        setCategories(prev => prev.filter(category => category.name !== name));

    const moveCategoryTasks =(fromCategory, toCategory) => {
        setTasks(prev => prev.map(t =>
            t.category === fromCategory ? { ...t, category: toCategory } : t
        ));
    };
    const clearAppData = () => {
        TodoRepository.clearAll();
        setUserName('');
        setTasks([]);
        setCategories([{ name: CATEGORY_GENERAL, color: DEFAULT_COLOR, borderColor: DEFAULT_BORDER }]);
    };
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedFilter(FILTER_ALL);
        setActiveStatusFilter('all');
    };
    const visibleTasks = tasks
        .filter(task => {
            const matchesSearch = (task.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.text || "").toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedFilter === FILTER_ALL || task.category === selectedFilter;

            let matchesStatus = true;
            if (activeStatusFilter === 'important') matchesStatus = task.isImportant;
            if (activeStatusFilter === STATUS_IN_PROGRESS) matchesStatus = task.status === STATUS_IN_PROGRESS;
            if (activeStatusFilter === 'overdue') matchesStatus = isTaskOverdue(task);
            if (activeStatusFilter === STATUS_COMPLETED) matchesStatus = task.status === STATUS_COMPLETED;

            return matchesSearch && matchesCategory && matchesStatus;
        })
        .sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (a.completed) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline) - new Date(b.deadline);
        });

    return {
        userName,
        categories,
        visibleTasks,
        hasTasks: tasks.length > 0,
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
    };
};
