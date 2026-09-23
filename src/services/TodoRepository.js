import { STORAGE_KEY_TASKS, 
    STORAGE_KEY_USER, 
    STORAGE_KEY_CATEGORIES,
    CATEGORY_GENERAL,
    DEFAULT_COLOR,
    DEFAULT_BORDER} from '../constants';

const createGeneralCategory = () => (
    { name: CATEGORY_GENERAL, color: DEFAULT_COLOR, borderColor: DEFAULT_BORDER }
);

const withGeneralCategory = (categories) =>
    categories.some(cat => cat.name === CATEGORY_GENERAL)
        ? categories
        : [createGeneralCategory(), ...categories];

    export const TodoRepository = {
        getAllData() {
        try {
            const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
            const savedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
            const savedUser = localStorage.getItem(STORAGE_KEY_USER);

            return {
                userName: savedUser || '',
                tasks: savedTasks ? JSON.parse(savedTasks) : [],
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