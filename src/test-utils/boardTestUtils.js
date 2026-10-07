import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_COLOR, DEFAULT_BORDER } from '../style/style-constants';
import {
  CATEGORY_GENERAL,
  STORAGE_KEY_CATEGORIES,
  STORAGE_KEY_TASKS,
  STORAGE_KEY_USER
} from '../constants';
import {
  CREATE_NOTE_CONTENT_LABEL,
  CREATE_NOTE_SUBMIT_BUTTON,
  TODO_APP_SEARCH_PLACEHOLDER
} from '../ui-texts';

export const WORK_CATEGORY = 'עבודה';

export const makeCategory = (name) => ({ name, color: DEFAULT_COLOR, borderColor: DEFAULT_BORDER });

export const makeTask = (overrides) => ({
  id: Math.random(),
  title: '',
  text: '',
  category: CATEGORY_GENERAL,
  status: 'pending',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  rotation: 0,
  ...overrides
});

export const seedBoard = ({ tasks = [], categories = [CATEGORY_GENERAL, WORK_CATEGORY] } = {}) => {
  localStorage.setItem(STORAGE_KEY_USER, 'ליבי');
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories.map(makeCategory)));
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
};

export const getCategoryTag = (name) => screen.getByRole('button', { name });

export const getCreateNoteContentField = () => screen.getByRole('textbox', { name: CREATE_NOTE_CONTENT_LABEL });

export const addNote = (text) => {
  userEvent.type(getCreateNoteContentField(), text);
  userEvent.click(screen.getByRole('button', { name: CREATE_NOTE_SUBMIT_BUTTON }));
};

// Real .focus() moves document.activeElement, unlike fireEvent.focus(); wrapping it in
// act() makes sure any React state update it triggers (e.g. a field switching from its
// formatted to its raw view) is flushed before the next interaction runs.
export const focusElement = (el) => act(() => { el.focus(); });

// Selects characters [start, end) of el's own first text node and fires selectionchange,
// the document-level signal a real text selection (mouse or touch) would send.
export const selectTextRange = (el, start, end) => {
  act(() => {
    const range = document.createRange();
    range.setStart(el.firstChild, start);
    range.setEnd(el.firstChild, end);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });
};

export const getSearchField = () => screen.getByRole('textbox', { name: TODO_APP_SEARCH_PLACEHOLDER.trim() });

export const searchFor = (term) => {
  // delay: null skips userEvent's real per-keystroke setTimeout; without it, a pending
  // timer can leak into the next test and collide with its own focus/selection work.
  userEvent.type(getSearchField(), term, { delay: null });
};

export const clickFilter = (label) => {
  userEvent.click(screen.getByRole('button', { name: label }));
};
