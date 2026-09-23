import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import {
  STORAGE_KEY_TASKS,
  STORAGE_KEY_USER,
  STORAGE_KEY_CATEGORIES,
  CATEGORY_GENERAL,
  DEFAULT_COLOR,
  DEFAULT_BORDER
} from './constants';
import {
  CANCEL_LABEL,
  CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT,
  LOGIN_NAME_PLACEHOLDER,
  LOGIN_SUBMIT_BUTTON,
  STICKY_NOTE_CHECK_TITLE_COMPLETED,
  STICKY_NOTE_CHECK_TITLE_IN_PROGRESS,
  STICKY_NOTE_CHECK_TITLE_PENDING,
  STICKY_NOTE_DELETE_TITLE,
  TASK_INPUT_ERROR_EMPTY,
  TASK_INPUT_PLACEHOLDER,
  TASK_INPUT_SUBMIT_BUTTON,
  TODO_APP_DELETE_TASK_TITLE,
  TODO_APP_FILTER_IMPORTANT_LABEL,
  TODO_APP_FILTER_IN_PROGRESS_LABEL,
  TODO_APP_FILTER_OVERDUE_LABEL,
  TODO_APP_SEARCH_PLACEHOLDER
} from './strings';

const WORK_CATEGORY = 'עבודה';
const PAST_DEADLINE = '2000-01-01';
const FUTURE_DEADLINE = '2999-01-01';

const makeCategory = (name) => ({ name, color: DEFAULT_COLOR, borderColor: DEFAULT_BORDER });

const makeTask = (overrides) => ({
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

const seedBoard = ({ tasks = [], categories = [CATEGORY_GENERAL, WORK_CATEGORY] } = {}) => {
  localStorage.setItem(STORAGE_KEY_USER, 'ליבי');
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories.map(makeCategory)));
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
};

const getCategoryTag = (name) =>
  screen.getAllByText(name).map((el) => el.closest('[tabindex="0"]')).find(Boolean);

const deleteCategory = (name) => {
  userEvent.click(within(getCategoryTag(name)).getByRole('button'));
  userEvent.click(screen.getByRole('button', { name: CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT }));
};

const addNote = (text) => {
  userEvent.type(screen.getByPlaceholderText(TASK_INPUT_PLACEHOLDER), text);
  userEvent.click(screen.getByRole('button', { name: TASK_INPUT_SUBMIT_BUTTON }));
};

const searchFor = (term) => {
  userEvent.type(screen.getByPlaceholderText(TODO_APP_SEARCH_PLACEHOLDER.trim()), term);
};

const clickFilter = (label) => {
  userEvent.click(screen.getByRole('button', { name: label }));
};

const getNoteDeleteButtons = () => screen.queryAllByRole('button', { name: STICKY_NOTE_DELETE_TITLE });

beforeEach(() => {
  localStorage.clear();
});

test('restores the general category in the add form and the filters when the stored categories list is empty', () => {
  seedBoard({ categories: [] });

  render(<App />);

  expect(screen.getByRole('option', { name: CATEGORY_GENERAL })).toBeInTheDocument();
  expect(getCategoryTag(CATEGORY_GENERAL)).toBeInTheDocument();
});

describe('adding a note', () => {
  test('shows the new note and clears the text field', () => {
    seedBoard();
    render(<App />);

    addNote('buy milk');

    expect(screen.getByText('buy milk')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(TASK_INPUT_PLACEHOLDER)).toHaveValue('');
  });

  test('rejects text made only of spaces and explains why', () => {
    seedBoard();
    render(<App />);

    addNote('   ');

    expect(screen.getByText(TASK_INPUT_ERROR_EMPTY)).toBeInTheDocument();
    expect(getNoteDeleteButtons()).toHaveLength(0);
  });

  test('files the note under the category chosen in the form', () => {
    seedBoard();
    render(<App />);

    userEvent.selectOptions(screen.getByRole('combobox'), WORK_CATEGORY);
    addNote('work item');
    userEvent.click(getCategoryTag(CATEGORY_GENERAL));
    expect(screen.queryByText('work item')).not.toBeInTheDocument();
    userEvent.click(getCategoryTag(WORK_CATEGORY));

    expect(screen.getByText('work item')).toBeInTheDocument();
  });

  test('keeps the deadline chosen in the form on the new note', () => {
    seedBoard();
    const { container } = render(<App />);

    fireEvent.change(container.querySelector('input[type="date"]'), { target: { value: '2030-01-15' } });
    addNote('pay rent');

    expect(screen.getByDisplayValue('2030-01-15')).toBeInTheDocument();
  });
});

describe('deleting a note', () => {
  test('removes the note after the deletion is confirmed', () => {
    seedBoard({ tasks: [makeTask({ text: 'old note' })] });
    render(<App />);

    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_DELETE_TITLE }));
    userEvent.click(screen.getByRole('button', { name: CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT }));

    expect(screen.queryByText('old note')).not.toBeInTheDocument();
  });

  test('keeps the note when the deletion is cancelled', () => {
    seedBoard({ tasks: [makeTask({ text: 'old note' })] });
    render(<App />);

    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_DELETE_TITLE }));
    expect(screen.getByText(TODO_APP_DELETE_TASK_TITLE)).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: CANCEL_LABEL }));

    expect(screen.queryByText(TODO_APP_DELETE_TASK_TITLE)).not.toBeInTheDocument();
    expect(screen.getByText('old note')).toBeInTheDocument();
  });
});

describe('searching', () => {
  const seedTwoNotes = () =>
    seedBoard({
      tasks: [
        makeTask({ title: 'groceries', text: 'milk and eggs' }),
        makeTask({ title: 'taxes', text: 'file report' })
      ]
    });

  test('matches the note text regardless of letter case', () => {
    seedTwoNotes();
    render(<App />);

    searchFor('MILK');

    expect(screen.getByText('milk and eggs')).toBeInTheDocument();
    expect(screen.queryByText('file report')).not.toBeInTheDocument();
  });

  test('matches the note title', () => {
    seedTwoNotes();
    render(<App />);

    searchFor('taxes');

    expect(screen.getByText('file report')).toBeInTheDocument();
    expect(screen.queryByText('milk and eggs')).not.toBeInTheDocument();
  });
});

describe('filtering', () => {
  test('shows only the notes of the selected category, and all notes again when it is selected twice', () => {
    seedBoard({
      tasks: [
        makeTask({ text: 'work note', category: WORK_CATEGORY }),
        makeTask({ text: 'general note' })
      ]
    });
    render(<App />);

    userEvent.click(getCategoryTag(WORK_CATEGORY));
    expect(screen.getByText('work note')).toBeInTheDocument();
    expect(screen.queryByText('general note')).not.toBeInTheDocument();

    userEvent.click(getCategoryTag(WORK_CATEGORY));
    expect(screen.getByText('work note')).toBeInTheDocument();
    expect(screen.getByText('general note')).toBeInTheDocument();
  });

  test('the important filter shows only important notes, and all notes again when switched off', () => {
    seedBoard({
      tasks: [
        makeTask({ text: 'urgent note', isImportant: true }),
        makeTask({ text: 'plain note' })
      ]
    });
    render(<App />);

    clickFilter(TODO_APP_FILTER_IMPORTANT_LABEL);
    expect(screen.getByText('urgent note')).toBeInTheDocument();
    expect(screen.queryByText('plain note')).not.toBeInTheDocument();

    clickFilter(TODO_APP_FILTER_IMPORTANT_LABEL);
    expect(screen.getByText('plain note')).toBeInTheDocument();
  });

  test('the in-progress filter shows only notes that are in progress', () => {
    seedBoard({
      tasks: [
        makeTask({ text: 'started note', status: 'in-progress' }),
        makeTask({ text: 'waiting note' })
      ]
    });
    render(<App />);

    clickFilter(TODO_APP_FILTER_IN_PROGRESS_LABEL);

    expect(screen.getByText('started note')).toBeInTheDocument();
    expect(screen.queryByText('waiting note')).not.toBeInTheDocument();
  });

  test('the overdue filter shows only unfinished notes whose deadline has passed', () => {
    seedBoard({
      tasks: [
        makeTask({ text: 'late note', deadline: PAST_DEADLINE }),
        makeTask({ text: 'finished late note', deadline: PAST_DEADLINE, status: 'completed', completed: true }),
        makeTask({ text: 'future note', deadline: FUTURE_DEADLINE }),
        makeTask({ text: 'undated note' })
      ]
    });
    render(<App />);

    clickFilter(TODO_APP_FILTER_OVERDUE_LABEL);

    expect(screen.getByText('late note')).toBeInTheDocument();
    expect(screen.queryByText('finished late note')).not.toBeInTheDocument();
    expect(screen.queryByText('future note')).not.toBeInTheDocument();
    expect(screen.queryByText('undated note')).not.toBeInTheDocument();
  });
});

describe('note status', () => {
  test('cycles from pending to in progress to completed and back to pending', () => {
    seedBoard({ tasks: [makeTask({ text: 'a note' })] });
    render(<App />);

    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_CHECK_TITLE_PENDING }));
    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_CHECK_TITLE_IN_PROGRESS }));
    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_CHECK_TITLE_COMPLETED }));

    expect(screen.getByRole('button', { name: STICKY_NOTE_CHECK_TITLE_PENDING })).toBeInTheDocument();
  });
});

describe('reloading the app', () => {
  test('keeps the name and the notes', () => {
    const { unmount } = render(<App />);
    userEvent.type(screen.getByPlaceholderText(LOGIN_NAME_PLACEHOLDER), 'ליבי');
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

describe('deleting a category', () => {
  test('a note added after deleting the category selected in the add form is filed under the general category', () => {
    seedBoard();
    render(<App />);

    userEvent.selectOptions(screen.getByRole('combobox'), WORK_CATEGORY);
    deleteCategory(WORK_CATEGORY);
    addNote('buy milk');
    userEvent.click(getCategoryTag(CATEGORY_GENERAL));

    expect(screen.getByText('buy milk')).toBeInTheDocument();
  });

  test('moves notes hidden by the current search to the general category too', () => {
    seedBoard({
      tasks: [
        makeTask({ text: 'alpha note', category: WORK_CATEGORY }),
        makeTask({ text: 'beta note', category: WORK_CATEGORY })
      ]
    });
    render(<App />);

    searchFor('alpha');
    expect(screen.queryByText('beta note')).not.toBeInTheDocument();
    deleteCategory(WORK_CATEGORY);
    userEvent.clear(screen.getByPlaceholderText(TODO_APP_SEARCH_PLACEHOLDER.trim()));
    userEvent.click(getCategoryTag(CATEGORY_GENERAL));

    expect(screen.getByText('alpha note')).toBeInTheDocument();
    expect(screen.getByText('beta note')).toBeInTheDocument();
  });

  test('clears the category filter when the filtered category is deleted', () => {
    seedBoard({ tasks: [makeTask({ text: 'work note', category: WORK_CATEGORY })] });
    render(<App />);

    userEvent.click(getCategoryTag(WORK_CATEGORY));
    deleteCategory(WORK_CATEGORY);

    expect(screen.getByText('work note')).toBeInTheDocument();
  });
});
