import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import {
  CATEGORY_GENERAL,
  STORAGE_KEY_CATEGORIES,
  STORAGE_KEY_TASKS,
  STORAGE_KEY_USER
} from './constants';
import {
  CREATE_NOTE_CONTENT_LABEL,
  LOGIN_INTRO,
  LOGIN_NAME_ERROR,
  LOGIN_NAME_PLACEHOLDER,
  LOGIN_STORAGE_NOTICE,
  LOGIN_SUBMIT_BUTTON,
  STICKY_NOTE_CHECK_TITLE_IN_PROGRESS,
  STICKY_NOTE_CHECK_TITLE_PENDING,
  TODO_APP_EMPTY_BOARD_TITLE
} from './ui-texts';
import {
  makeCategory,
  makeTask,
  seedBoard,
  getCategoryTag,
  getCreateNoteContentField,
  addNote
} from './test-utils/boardTestUtils';

beforeEach(() => {
  localStorage.clear();
});

test('restores the general category in the add form and the filters when the stored categories list is empty', () => {
  seedBoard({ categories: [] });

  render(<App />);

  expect(screen.getByRole('option', { name: CATEGORY_GENERAL })).toBeInTheDocument();
  expect(getCategoryTag(CATEGORY_GENERAL)).toBeInTheDocument();
});

// Regression (Moriya, code-read risk): a syntactically-valid-JSON but malformed entry
// (e.g. a stray null) used to throw uncaught while normalizing tasks, crashing the
// whole board on load - including the name and categories, which have nothing wrong
// with them. Each stored key must fail independently (see TodoRepository.js).
test('a malformed entry in stored tasks does not crash the board - it loads as if tasks were empty', () => {
  localStorage.setItem(STORAGE_KEY_USER, 'ליבי');
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify([makeCategory(CATEGORY_GENERAL)]));
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify([null]));

  render(<App />);

  expect(screen.getByText('ליבי')).toBeInTheDocument();
  expect(getCategoryTag(CATEGORY_GENERAL)).toBeInTheDocument();
  expect(screen.getByText(TODO_APP_EMPTY_BOARD_TITLE)).toBeInTheDocument();
});

// Regression (Moriya, high severity): dropping the *entire* tasks array on one bad
// entry (the previous fix) wasn't enough - useTodoManager's own save effect then
// writes that now-empty array straight back over the stored data on the very next
// render, permanently losing every valid note that happened to sit next to the one
// corrupt entry. Only the malformed entry itself must be dropped.
test('a malformed entry alongside a valid task loses only the malformed one, and does not erase the valid one on the next save', () => {
  localStorage.setItem(STORAGE_KEY_USER, 'ליבי');
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify([makeCategory(CATEGORY_GENERAL)]));
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify([makeTask({ text: 'valid note' }), null]));

  render(<App />);

  expect(screen.getByText('valid note')).toBeInTheDocument();
  // The save effect (triggered by state existing at all, e.g. on mount) must not have
  // written the corrupt entry's absence back as "the whole list is gone too".
  const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY_TASKS));
  expect(savedTasks).toHaveLength(1);
  expect(savedTasks[0].text).toBe('valid note');
});

describe('the welcome screen', () => {
  const getNameField = () => screen.getByRole('textbox', { name: LOGIN_NAME_PLACEHOLDER });
  const submitName = () => userEvent.click(screen.getByRole('button', { name: LOGIN_SUBMIT_BUTTON }));
  const enterName = (name) => {
    userEvent.type(getNameField(), name);
    submitName();
  };

  test('explains what the board is and where the data is kept', () => {
    render(<App />);

    expect(screen.getByText(LOGIN_INTRO)).toBeInTheDocument();
    expect(screen.getByText(LOGIN_STORAGE_NOTICE)).toBeInTheDocument();
  });

  test('offers only one way in: entering a name', () => {
    render(<App />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  test.each([
    ['nothing', ''],
    ['only spaces', '   '],
    ['a single character', 'ל']
  ])('entering %s explains the name is required and keeps the board closed', (_, name) => {
    render(<App />);

    if (name) userEvent.type(getNameField(), name);
    submitName();

    expect(screen.getByRole('alert')).toHaveTextContent(LOGIN_NAME_ERROR);
    expect(screen.queryByRole('textbox', { name: CREATE_NOTE_CONTENT_LABEL })).not.toBeInTheDocument();
  });

  test('after a rejected name the field is marked invalid, described by the error, and focused', () => {
    render(<App />);

    submitName();

    const nameField = getNameField();
    expect(nameField).toHaveAttribute('aria-invalid', 'true');
    expect(nameField).toHaveAccessibleDescription(LOGIN_NAME_ERROR);
    expect(nameField).toHaveFocus();
  });

  test('the error stays while the name is still too short', () => {
    render(<App />);
    submitName();

    userEvent.type(getNameField(), 'ל');

    expect(screen.getByRole('alert')).toHaveTextContent(LOGIN_NAME_ERROR);
    expect(getNameField()).toHaveAttribute('aria-invalid', 'true');
  });

  test('the error stays while the name is only spaces around too few characters', () => {
    render(<App />);
    submitName();

    userEvent.type(getNameField(), '  ל  ');

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('the error goes away once the name is long enough', () => {
    render(<App />);
    submitName();

    userEvent.type(getNameField(), 'לי');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getNameField()).toHaveAttribute('aria-invalid', 'false');
  });

  test('a valid name opens the board and is stored without surrounding spaces', () => {
    render(<App />);

    enterName('  ליבי  ');

    expect(getCreateNoteContentField()).toBeInTheDocument();
    expect(screen.getByText('ליבי')).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY_USER)).toBe('ליבי');
  });
});

describe('reloading the app', () => {
  test('corrupt label data does not hide the saved notes', () => {
    seedBoard({ tasks: [makeTask({ text: 'saved note' })] });
    localStorage.setItem(STORAGE_KEY_CATEGORIES, '{not valid json');

    render(<App />);

    expect(screen.getByText('saved note')).toBeInTheDocument();
  });

  test('keeps the name and the notes', () => {
    const { unmount } = render(<App />);
    userEvent.type(screen.getByRole('textbox', { name: LOGIN_NAME_PLACEHOLDER }), 'ליבי');
    userEvent.click(screen.getByRole('button', { name: LOGIN_SUBMIT_BUTTON }));
    addNote('buy milk');

    unmount();
    render(<App />);

    expect(screen.queryByPlaceholderText(LOGIN_NAME_PLACEHOLDER)).not.toBeInTheDocument();
    expect(screen.getByText('ליבי')).toBeInTheDocument();
    expect(screen.getByText('buy milk')).toBeInTheDocument();
  });

  test('keeps a status change made before the reload', () => {
    seedBoard({ tasks: [makeTask({ text: 'a note' })] });
    const { unmount } = render(<App />);
    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_CHECK_TITLE_PENDING }));

    unmount();
    render(<App />);

    expect(screen.getByRole('button', { name: STICKY_NOTE_CHECK_TITLE_IN_PROGRESS })).toBeInTheDocument();
  });
});
