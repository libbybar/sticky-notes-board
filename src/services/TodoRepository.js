import { STORAGE_KEY_TASKS,
    STORAGE_KEY_USER,
    STORAGE_KEY_CATEGORIES,
    CATEGORY_GENERAL } from '../constants';
import { DEFAULT_COLOR, DEFAULT_BORDER } from '../style/style-constants';

const createGeneralCategory = () => (
    { name: CATEGORY_GENERAL, color: DEFAULT_COLOR, borderColor: DEFAULT_BORDER }
);

const withGeneralCategory = (categories) =>
    categories.some(cat => cat.name === CATEGORY_GENERAL)
        ? categories
        : [createGeneralCategory(), ...categories];

// פתקים ישנים נשמרו בלי שדות הצ'ק ליסט. ברירת המחדל שומרת עליהם ככתובת טקסט רגילה.
// לפתקי רשימה, task.text נבנה מחדש מהפריטים בכל טעינה: זה מתקן פתקים שנשמרו לפני
// שהעריכה שמרה על סנכרון (חיפוש וחלונית המחיקה תלויים ב-text גם עבור רשימות).
const normalizeTask = (task) => {
    const isChecklist = !!task.isChecklist;
    const checklistItems = Array.isArray(task.checklistItems) ? task.checklistItems : [];
    return {
        ...task,
        isChecklist,
        checklistItems,
        text: isChecklist ? checklistItems.map(item => item.text).join('\n') : task.text
    };
};

    export const TodoRepository = {
        getAllData() {
        try {
            const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
            const savedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
            const savedUser = localStorage.getItem(STORAGE_KEY_USER);

            return {
                userName: savedUser || '',
                tasks: savedTasks ? JSON.parse(savedTasks).map(normalizeTask) : [],
                categories: withGeneralCategory(savedCategories ? JSON.parse(savedCategories) : [])
            };
        } catch (e) {
            console.error("Error loading from localStorage", e);
            return {
                userName: '',
                tasks: [],
                categories: [createGeneralCategory()]
            };
        }
    },
    saveTasks(tasks) {
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    },
    saveCategories(categories) {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    },
    saveUser(userName) {
        localStorage.setItem(STORAGE_KEY_USER, userName);
    },
    clearAll() {
        [STORAGE_KEY_USER, STORAGE_KEY_TASKS, STORAGE_KEY_CATEGORIES].forEach(key => 
            localStorage.removeItem(key)
        );
    }
};