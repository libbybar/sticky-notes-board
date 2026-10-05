import {
    STORAGE_KEY_TASKS,
    STORAGE_KEY_USER,
    STORAGE_KEY_CATEGORIES,
    CATEGORY_GENERAL
} from '../constants';
import { DEFAULT_COLOR, DEFAULT_BORDER } from '../style/style-constants';

const createGeneralCategory = () => (
    { name: CATEGORY_GENERAL, color: DEFAULT_COLOR, borderColor: DEFAULT_BORDER }
);

const withGeneralCategory = (categories) =>
    categories.some(cat => cat.name === CATEGORY_GENERAL)
        ? categories
        : [createGeneralCategory(), ...categories];

// Older notes were saved without the checklist fields; the defaults keep them as plain text notes.
// For checklist notes, task.text is rebuilt from the items on every load. This repairs notes saved
// before editing kept the two in sync (search and the delete dialog rely on text for checklists too).
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

// Each storage item loads on its own: corrupt data in one must not reset the others,
// otherwise re-entering a name would save the empty list over valid notes.
const readStoredValue = (key, parse, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? parse(raw) : fallback;
    } catch (e) {
        console.error(`Error loading ${key} from localStorage`, e);
        return fallback;
    }
};

const parseJsonArray = (raw) => {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Stored value is not a list');
    return parsed;
};

const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

// Drops only the malformed-but-valid-JSON entries themselves (e.g. a stray null),
// rather than letting one bad entry throw and discard the whole array: the caller
// (useTodoManager) saves this result straight back over the stored data on the next
// change, so losing every valid note alongside the one corrupt entry would be a
// silent, permanent data loss - not just a crash.
const dropMalformedEntries = (list) => list.filter(isPlainObject);

export const TodoRepository = {
    getAllData() {
        return {
            userName: readStoredValue(STORAGE_KEY_USER, (raw) => raw, ''),
            tasks: readStoredValue(
                STORAGE_KEY_TASKS,
                (raw) => dropMalformedEntries(parseJsonArray(raw)).map(normalizeTask),
                []
            ),
            categories: readStoredValue(
                STORAGE_KEY_CATEGORIES,
                (raw) => withGeneralCategory(dropMalformedEntries(parseJsonArray(raw))),
                [createGeneralCategory()]
            )
        };
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
