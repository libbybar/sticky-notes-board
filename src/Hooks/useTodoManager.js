import { useState, useEffect } from 'react';
import { DEFAULT_COLOR, DEFAULT_BORDER } from '../style/style-constants';
import { CATEGORY_GENERAL, STATUS_PENDING, FILTER_ALL } from '../constants';
import { TodoRepository } from '../services/TodoRepository';


export const useTodoManager = () => {
    const initialData = TodoRepository.getAllData();

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

    const moveToCategory = (id, category) => _updateTask(id, () => ({ category }));

const toggleImportant = (id) => _updateTask(id, (t) => ({ isImportant: !t.isImportant })); 

    const toggleTaskStatus = (id) => {
        _updateTask(id, (task) => {
            const nextStatus = {
                'pending': 'in-progress',
                'in-progress': 'completed',
                'completed': 'pending'
            }[task.status] || 'in-progress';

            return {
                status: nextStatus,
                completed: nextStatus === 'completed'
            };
        });
    };
    const confirmDeleteTask = (id) => {
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
    const moveCategoryTasks = (fromCategory, toCategory) => {
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
    const isTaskOverdue = (task) => {
        if (!task.deadline || task.completed) return false;
        return new Date(task.deadline) < new Date().setHours(0, 0, 0, 0);
    };
    const visibleTasks = tasks
        .filter(task => {
            const matchesSearch = (task.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.text || "").toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedFilter === FILTER_ALL || task.category === selectedFilter;

            let matchesStatus = true;
            if (activeStatusFilter === 'important') matchesStatus = task.isImportant;
            if (activeStatusFilter === 'in-progress') matchesStatus = task.status === 'in-progress';
            if (activeStatusFilter === 'overdue') matchesStatus = isTaskOverdue(task);

            return matchesSearch && matchesCategory && matchesStatus;
        })
        .sort((a, b) => {
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
        toggleTaskStatus,
        confirmDeleteTask,
        deleteMultipleTasks,
        updateMultipleTasksCategory,
        moveCategoryTasks,
        clearFilters,
        clearAppData
    };
};