import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { DEFAULT_COLOR, DEFAULT_BORDER } from './style/style-constants';
import {
  CATEGORY_GENERAL,
  STORAGE_KEY_CATEGORIES,
  STORAGE_KEY_TASKS,
  STORAGE_KEY_USER
} from './constants';
import {
  BULK_DELETE_LABEL,
  CANCEL_LABEL,
  CATEGORY_MANAGER_ADD_LABEL,
  CATEGORY_MANAGER_COLOR_LABEL,
  CATEGORY_MANAGER_DELETE_LABEL,
  CATEGORY_MANAGER_ERROR_DUPLICATE,
  CATEGORY_MANAGER_ERROR_EMPTY,
  CATEGORY_MANAGER_NAME_PLACEHOLDER,
  CATEGORY_MANAGER_NEW_COLOR_LABEL,
  CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT,
  LOGIN_INTRO,
  LOGIN_NAME_ERROR,
  LOGIN_NAME_PLACEHOLDER,
  LOGIN_STORAGE_NOTICE,
  LOGIN_SUBMIT_BUTTON,
  STICKY_NOTE_CATEGORY_LABEL,
  STICKY_NOTE_CHECK_TITLE_COMPLETED,
  STICKY_NOTE_CHECK_TITLE_IN_PROGRESS,
  STICKY_NOTE_CHECK_TITLE_PENDING,
  STICKY_NOTE_DATE_LABEL,
  STICKY_NOTE_DELETE_TITLE,
  STICKY_NOTE_SELECT_LABEL,
  STICKY_NOTE_TEXT_LABEL,
  STICKY_NOTE_TITLE_PLACEHOLDER,
  TASK_INPUT_CATEGORY_LABEL,
  TASK_INPUT_DATE_LABEL,
  TASK_INPUT_ERROR_EMPTY,
  TASK_INPUT_PLACEHOLDER,
  TASK_INPUT_SUBMIT_BUTTON,
  TODO_APP_BULK_BANNER_SELECTED_COUNT,
  TODO_APP_BULK_DELETE_MESSAGE,
  TODO_APP_CHANGE_CATEGORY_OPTION,
  TODO_APP_CLEAR_BOARD_TOOLTIP,
  TODO_APP_CLEAR_FILTERS_LABEL,
  TODO_APP_DELETE_CATEGORY_TITLE,
  TODO_APP_DELETE_TASK_TITLE,
  TODO_APP_EMPTY_BOARD_MESSAGE,
  TODO_APP_EMPTY_BOARD_TITLE,
  TODO_APP_FILTER_IMPORTANT_LABEL,
  TODO_APP_FILTER_IN_PROGRESS_LABEL,
  TODO_APP_FILTER_OVERDUE_LABEL,
  TODO_APP_NO_RESULTS_MESSAGE,
  TODO_APP_NO_RESULTS_TITLE,
  TODO_APP_RESET_MESSAGE,
  TODO_APP_RESET_TITLE,
  TODO_APP_SEARCH_PLACEHOLDER,
  TODO_APP_SELECTION_MODE_OFF_LABEL
} from './ui-texts';

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

const getCategoryTag = (name) => screen.getByRole('button', { name });

const deleteCategory = (name) => {
  userEvent.click(screen.getByRole('button', { name: CATEGORY_MANAGER_DELETE_LABEL(name) }));
  userEvent.click(screen.getByRole('button', { name: CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT }));
};

const addNote = (text) => {
  userEvent.type(screen.getByRole('textbox', { name: TASK_INPUT_PLACEHOLDER }), text);
  userEvent.click(screen.getByRole('button', { name: TASK_INPUT_SUBMIT_BUTTON }));
};

const getSearchField = () => screen.getByRole('textbox', { name: TODO_APP_SEARCH_PLACEHOLDER.trim() });

const searchFor = (term) => {
  userEvent.type(getSearchField(), term);
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
    expect(screen.getByRole('textbox', { name: TASK_INPUT_PLACEHOLDER })).toHaveValue('');
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

    userEvent.selectOptions(screen.getByRole('combobox', { name: TASK_INPUT_CATEGORY_LABEL }), WORK_CATEGORY);
    addNote('work item');
    userEvent.click(getCategoryTag(CATEGORY_GENERAL));
    expect(screen.queryByText('work item')).not.toBeInTheDocument();
    userEvent.click(getCategoryTag(WORK_CATEGORY));

    expect(screen.getByText('work item')).toBeInTheDocument();
  });

  test('keeps the deadline chosen in the form on the new note', () => {
    seedBoard();
    render(<App />);

    fireEvent.change(screen.getByLabelText(TASK_INPUT_DATE_LABEL), { target: { value: '2030-01-15' } });
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

describe('empty states', () => {
  test('a board without notes points to creating the first note', () => {
    seedBoard();
    render(<App />);

    expect(screen.getByText(TODO_APP_EMPTY_BOARD_TITLE)).toBeInTheDocument();
    expect(screen.getByText(TODO_APP_EMPTY_BOARD_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(TODO_APP_NO_RESULTS_TITLE)).not.toBeInTheDocument();
  });

  test('a board with notes does not show the empty board message', () => {
    seedBoard({ tasks: [makeTask({ text: 'a note' })] });
    render(<App />);

    expect(screen.queryByText(TODO_APP_EMPTY_BOARD_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByText(TODO_APP_NO_RESULTS_TITLE)).not.toBeInTheDocument();
  });

  test('a search that matches nothing says so instead of calling the board empty', () => {
    seedBoard({ tasks: [makeTask({ text: 'a note' })] });
    render(<App />);

    searchFor('zzz');

    expect(screen.getByText(TODO_APP_NO_RESULTS_TITLE)).toBeInTheDocument();
    expect(screen.getByText(TODO_APP_NO_RESULTS_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(TODO_APP_EMPTY_BOARD_TITLE)).not.toBeInTheDocument();
  });

  test('a status filter that matches nothing says so', () => {
    seedBoard({ tasks: [makeTask({ text: 'a note' })] });
    render(<App />);

    clickFilter(TODO_APP_FILTER_OVERDUE_LABEL);

    expect(screen.getByText(TODO_APP_NO_RESULTS_TITLE)).toBeInTheDocument();
  });

  test('the clear button resets the search, the category and the status filters together', () => {
    seedBoard({ tasks: [makeTask({ text: 'plain note' })] });
    render(<App />);
    searchFor('plain');
    userEvent.click(getCategoryTag(WORK_CATEGORY));
    clickFilter(TODO_APP_FILTER_IMPORTANT_LABEL);
    expect(screen.getByText(TODO_APP_NO_RESULTS_TITLE)).toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: TODO_APP_CLEAR_FILTERS_LABEL }));

    expect(screen.getByText('plain note')).toBeInTheDocument();
    expect(getSearchField()).toHaveValue('');
    expect(screen.queryByText(TODO_APP_NO_RESULTS_TITLE)).not.toBeInTheDocument();
  });

  test('a board with no notes offers no clear button', () => {
    seedBoard();
    render(<App />);

    expect(screen.queryByRole('button', { name: TODO_APP_CLEAR_FILTERS_LABEL })).not.toBeInTheDocument();
  });
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
    expect(screen.queryByRole('textbox', { name: TASK_INPUT_PLACEHOLDER })).not.toBeInTheDocument();
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

    expect(screen.getByRole('textbox', { name: TASK_INPUT_PLACEHOLDER })).toBeInTheDocument();
    expect(screen.getByText('ליבי')).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY_USER)).toBe('ליבי');
  });
});

describe('reloading the app', () => {
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

const getSavedCategory = (name) =>
  JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES)).find((cat) => cat.name === name);

describe('control states and messages are announced', () => {
  test.each([
    ['important', TODO_APP_FILTER_IMPORTANT_LABEL],
    ['in-progress', TODO_APP_FILTER_IN_PROGRESS_LABEL],
    ['overdue', TODO_APP_FILTER_OVERDUE_LABEL]
  ])('the %s filter announces whether it is on', (_, label) => {
    seedBoard({ tasks: [makeTask({ text: 'a note' })] });
    render(<App />);
    const filterButton = screen.getByRole('button', { name: label });

    expect(filterButton).toHaveAttribute('aria-pressed', 'false');
    userEvent.click(filterButton);
    expect(filterButton).toHaveAttribute('aria-pressed', 'true');
    userEvent.click(filterButton);
    expect(filterButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('switching to another status filter turns the previous one off', () => {
    seedBoard({ tasks: [makeTask({ text: 'a note' })] });
    render(<App />);

    clickFilter(TODO_APP_FILTER_IMPORTANT_LABEL);
    clickFilter(TODO_APP_FILTER_IN_PROGRESS_LABEL);

    expect(screen.getByRole('button', { name: TODO_APP_FILTER_IMPORTANT_LABEL })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: TODO_APP_FILTER_IN_PROGRESS_LABEL })).toHaveAttribute('aria-pressed', 'true');
  });

  test('the empty note text error is announced as an alert', () => {
    seedBoard();
    render(<App />);

    addNote('   ');

    expect(screen.getByRole('alert')).toHaveTextContent(TASK_INPUT_ERROR_EMPTY);
  });

  test('an empty category name is rejected with an announced explanation', () => {
    seedBoard();
    render(<App />);

    userEvent.click(screen.getByRole('button', { name: CATEGORY_MANAGER_ADD_LABEL }));

    expect(screen.getByRole('alert')).toHaveTextContent(CATEGORY_MANAGER_ERROR_EMPTY);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES))).toHaveLength(2);
  });

  test('a category name that already exists is rejected with an announced explanation, regardless of letter case', () => {
    seedBoard({ categories: [CATEGORY_GENERAL, 'Home'] });
    render(<App />);

    userEvent.type(screen.getByRole('textbox', { name: CATEGORY_MANAGER_NAME_PLACEHOLDER }), 'home');
    userEvent.click(screen.getByRole('button', { name: CATEGORY_MANAGER_ADD_LABEL }));

    expect(screen.getByRole('alert')).toHaveTextContent(CATEGORY_MANAGER_ERROR_DUPLICATE('home'));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES))).toHaveLength(2);
  });
});

describe('confirmation dialogs', () => {
  const openDeleteNoteDialog = () => {
    seedBoard({ tasks: [makeTask({ text: 'old note' })] });
    render(<App />);
    const opener = screen.getByRole('button', { name: STICKY_NOTE_DELETE_TITLE });
    userEvent.click(opener);
    return opener;
  };
  const openDeleteCategoryDialog = () => {
    seedBoard();
    render(<App />);
    const opener = screen.getByRole('button', { name: CATEGORY_MANAGER_DELETE_LABEL(WORK_CATEGORY) });
    userEvent.click(opener);
    return opener;
  };
  const openResetDialog = () => {
    seedBoard();
    render(<App />);
    const opener = screen.getByRole('button', { name: TODO_APP_CLEAR_BOARD_TOOLTIP });
    userEvent.click(opener);
    return opener;
  };
  const openBulkDeleteDialog = () => {
    seedBoard({ tasks: [makeTask({ text: 'old note' })] });
    render(<App />);
    userEvent.click(screen.getByRole('button', { name: TODO_APP_SELECTION_MODE_OFF_LABEL }));
    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_SELECT_LABEL }));
    const opener = screen.getByRole('button', { name: BULK_DELETE_LABEL });
    userEvent.click(opener);
    return opener;
  };
  const dialogs = [
    ['deleting a note', openDeleteNoteDialog, TODO_APP_DELETE_TASK_TITLE],
    ['deleting a category', openDeleteCategoryDialog, TODO_APP_DELETE_CATEGORY_TITLE],
    ['resetting the board', openResetDialog, TODO_APP_RESET_TITLE],
    ['deleting selected notes', openBulkDeleteDialog, BULK_DELETE_LABEL]
  ];

  test.each(dialogs)('the dialog for %s is a modal dialog named by its title', (_, open, title) => {
    open();

    const dialog = screen.getByRole('dialog', { name: title });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test.each(dialogs)('the dialog for %s starts with focus on the cancel button', (_, open) => {
    open();

    expect(within(screen.getByRole('dialog')).getByRole('button', { name: CANCEL_LABEL })).toHaveFocus();
  });

  test.each(dialogs)('the dialog for %s closes with Escape', (_, open) => {
    open();

    userEvent.keyboard('[Escape]');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test.each(dialogs)('Tab never leaves the dialog for %s', (_, open) => {
    open();
    const dialog = screen.getByRole('dialog');

    userEvent.tab();
    expect(dialog).toContainElement(document.activeElement);
    userEvent.tab();
    expect(dialog).toContainElement(document.activeElement);
    userEvent.tab();
    expect(dialog).toContainElement(document.activeElement);
  });

  test.each(dialogs)('Shift+Tab never leaves the dialog for %s', (_, open) => {
    open();
    const dialog = screen.getByRole('dialog');

    userEvent.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement);
    userEvent.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement);
    userEvent.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement);
  });

  test.each(dialogs)('cancelling the dialog for %s returns focus to the control that opened it', (_, open) => {
    const opener = open();

    userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: CANCEL_LABEL }));

    expect(opener).toHaveFocus();
  });

  test.each(dialogs)('closing the dialog for %s with Escape returns focus to the control that opened it', (_, open) => {
    const opener = open();

    userEvent.keyboard('[Escape]');

    expect(opener).toHaveFocus();
  });

  test('the reset dialog is described by its warning message', () => {
    openResetDialog();

    expect(screen.getByRole('dialog')).toHaveAccessibleDescription(TODO_APP_RESET_MESSAGE);
  });

  test('Escape on the delete dialog keeps the note', () => {
    openDeleteNoteDialog();

    userEvent.keyboard('[Escape]');

    expect(screen.getByText('old note')).toBeInTheDocument();
  });

  test('Enter right after the delete dialog opens cancels instead of deleting', () => {
    openDeleteNoteDialog();

    userEvent.keyboard('[Enter]');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('old note')).toBeInTheDocument();
  });

  test('Escape on the category dialog keeps the category', () => {
    openDeleteCategoryDialog();

    userEvent.keyboard('[Escape]');

    expect(getCategoryTag(WORK_CATEGORY)).toBeInTheDocument();
  });
});

describe('category tags as filter buttons', () => {
  test('a category tag announces whether its filter is on', () => {
    seedBoard();
    render(<App />);
    const tag = getCategoryTag(WORK_CATEGORY);

    expect(tag).toHaveAttribute('aria-pressed', 'false');
    userEvent.click(tag);
    expect(tag).toHaveAttribute('aria-pressed', 'true');
    userEvent.click(tag);
    expect(tag).toHaveAttribute('aria-pressed', 'false');
  });

  test('selecting another category turns the previous tag off', () => {
    seedBoard();
    render(<App />);

    userEvent.click(getCategoryTag(WORK_CATEGORY));
    userEvent.click(getCategoryTag(CATEGORY_GENERAL));

    expect(getCategoryTag(WORK_CATEGORY)).toHaveAttribute('aria-pressed', 'false');
    expect(getCategoryTag(CATEGORY_GENERAL)).toHaveAttribute('aria-pressed', 'true');
  });

  describe('using the other controls of a tag', () => {
    const seedWorkAndGeneralNotes = () =>
      seedBoard({
        tasks: [
          makeTask({ text: 'work note', category: WORK_CATEGORY }),
          makeTask({ text: 'general note' })
        ]
      });

    test('clicking the color control does not turn the category filter on', () => {
      seedWorkAndGeneralNotes();
      render(<App />);

      userEvent.click(screen.getByLabelText(CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY)));

      expect(getCategoryTag(WORK_CATEGORY)).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByText('work note')).toBeInTheDocument();
      expect(screen.getByText('general note')).toBeInTheDocument();
    });

    test('changing a category color leaves the filter and the notes as they were', () => {
      seedWorkAndGeneralNotes();
      render(<App />);
      const colorControl = screen.getByLabelText(CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY));

      userEvent.click(colorControl);
      fireEvent.change(colorControl, { target: { value: '#ff0000' } });

      expect(getCategoryTag(WORK_CATEGORY)).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByText('general note')).toBeInTheDocument();
    });

    test('opening and cancelling the delete dialog leaves the filter off', () => {
      seedWorkAndGeneralNotes();
      render(<App />);

      userEvent.click(screen.getByRole('button', { name: CATEGORY_MANAGER_DELETE_LABEL(WORK_CATEGORY) }));
      userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: CANCEL_LABEL }));

      expect(getCategoryTag(WORK_CATEGORY)).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test.each([
    ['Enter', '[Enter]'],
    ['Space', '[Space]']
  ])('a category tag is switched on once by %s and filters the notes', (_, keys) => {
    seedBoard({
      tasks: [
        makeTask({ text: 'work note', category: WORK_CATEGORY }),
        makeTask({ text: 'general note' })
      ]
    });
    render(<App />);
    const tag = getCategoryTag(WORK_CATEGORY);

    tag.focus();
    userEvent.keyboard(keys);

    expect(tag).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('work note')).toBeInTheDocument();
    expect(screen.queryByText('general note')).not.toBeInTheDocument();
  });
});

describe('bulk actions with notes hidden by a search', () => {
  const selectAllThenSearch = (term) => {
    seedBoard({
      tasks: [
        makeTask({ text: 'alpha note' }),
        makeTask({ text: 'beta note' })
      ]
    });
    render(<App />);
    userEvent.click(screen.getByRole('button', { name: TODO_APP_SELECTION_MODE_OFF_LABEL }));
    screen.getAllByRole('button', { name: STICKY_NOTE_SELECT_LABEL }).forEach((button) => userEvent.click(button));
    searchFor(term);
  };

  test('the banner counts only the selected notes that are still visible', () => {
    selectAllThenSearch('alpha');

    expect(screen.getByText(TODO_APP_BULK_BANNER_SELECTED_COUNT(1))).toBeInTheDocument();
  });

  test('deleting removes only the visible selected notes and keeps the hidden ones', () => {
    selectAllThenSearch('alpha');

    userEvent.click(screen.getByRole('button', { name: BULK_DELETE_LABEL }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(TODO_APP_BULK_DELETE_MESSAGE(1))).toBeInTheDocument();
    userEvent.click(within(dialog).getByRole('button', { name: CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT }));
    userEvent.clear(getSearchField());

    expect(screen.queryByText('alpha note')).not.toBeInTheDocument();
    expect(screen.getByText('beta note')).toBeInTheDocument();
  });

  test('changing the category affects only the visible selected notes', () => {
    selectAllThenSearch('alpha');

    userEvent.selectOptions(screen.getByRole('combobox', { name: TODO_APP_CHANGE_CATEGORY_OPTION }), WORK_CATEGORY);
    userEvent.clear(getSearchField());
    userEvent.click(getCategoryTag(WORK_CATEGORY));

    expect(screen.getByText('alpha note')).toBeInTheDocument();
    expect(screen.queryByText('beta note')).not.toBeInTheDocument();
  });

  test('when every selected note is hidden there is no bulk action to run', () => {
    selectAllThenSearch('zzz');

    expect(screen.queryByRole('button', { name: BULK_DELETE_LABEL })).not.toBeInTheDocument();
    expect(screen.queryByText(TODO_APP_BULK_BANNER_SELECTED_COUNT(2))).not.toBeInTheDocument();
  });
});

describe('selecting notes', () => {
  const startSelecting = () => {
    seedBoard({ tasks: [makeTask({ text: 'a note' })] });
    render(<App />);
    userEvent.click(screen.getByRole('button', { name: TODO_APP_SELECTION_MODE_OFF_LABEL }));
    return screen.getByRole('button', { name: STICKY_NOTE_SELECT_LABEL });
  };

  test('a note is selected and unselected with its selection button', () => {
    const selectButton = startSelecting();

    expect(selectButton).toHaveAttribute('aria-pressed', 'false');
    userEvent.click(selectButton);
    expect(selectButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(TODO_APP_BULK_BANNER_SELECTED_COUNT(1))).toBeInTheDocument();
    userEvent.click(selectButton);
    expect(selectButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByText(TODO_APP_BULK_BANNER_SELECTED_COUNT(1))).not.toBeInTheDocument();
  });

  test('the selection button works with the keyboard', () => {
    const selectButton = startSelecting();

    selectButton.focus();
    userEvent.keyboard('[Enter]');

    expect(selectButton).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('note fields are exposed by name', () => {
  const seedOneNote = (overrides) =>
    seedBoard({
      tasks: [
        makeTask({
          title: 'groceries',
          text: 'milk and eggs',
          category: WORK_CATEGORY,
          deadline: '2030-01-15',
          ...overrides
        })
      ]
    });

  test('each field of a note is found by its name and holds that note\'s value', () => {
    seedOneNote();
    render(<App />);

    expect(screen.getByRole('textbox', { name: STICKY_NOTE_TITLE_PLACEHOLDER })).toHaveTextContent('groceries');
    expect(screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL })).toHaveTextContent('milk and eggs');
    expect(screen.getByLabelText(STICKY_NOTE_DATE_LABEL)).toHaveValue('2030-01-15');
    expect(screen.getByRole('combobox', { name: STICKY_NOTE_CATEGORY_LABEL })).toHaveValue(WORK_CATEGORY);
  });

  test('the title and text of a completed note are announced as read-only', () => {
    seedOneNote({ status: 'completed', completed: true });
    render(<App />);

    expect(screen.getByRole('textbox', { name: STICKY_NOTE_TITLE_PLACEHOLDER })).toHaveAttribute('aria-readonly', 'true');
    expect(screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL })).toHaveAttribute('aria-readonly', 'true');
  });

  test('the title and text of an unfinished note are announced as editable', () => {
    seedOneNote();
    render(<App />);

    expect(screen.getByRole('textbox', { name: STICKY_NOTE_TITLE_PLACEHOLDER })).toHaveAttribute('aria-readonly', 'false');
    expect(screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL })).toHaveAttribute('aria-readonly', 'false');
  });

  test('changing the category field files the note under that category', () => {
    seedOneNote({ category: CATEGORY_GENERAL });
    render(<App />);

    userEvent.selectOptions(screen.getByRole('combobox', { name: STICKY_NOTE_CATEGORY_LABEL }), WORK_CATEGORY);
    userEvent.click(getCategoryTag(WORK_CATEGORY));

    expect(screen.getByText('milk and eggs')).toBeInTheDocument();
  });

  test('changing the date field updates the note deadline', () => {
    seedOneNote();
    render(<App />);

    fireEvent.change(screen.getByLabelText(STICKY_NOTE_DATE_LABEL), { target: { value: '2031-02-03' } });

    expect(screen.getByLabelText(STICKY_NOTE_DATE_LABEL)).toHaveValue('2031-02-03');
  });
});

describe('board and category controls are exposed by name', () => {
  test('the reset button is named by its tooltip text and opens the reset confirmation', () => {
    seedBoard();
    render(<App />);

    userEvent.click(screen.getByRole('button', { name: TODO_APP_CLEAR_BOARD_TOOLTIP }));

    expect(screen.getByText(TODO_APP_RESET_TITLE)).toBeInTheDocument();
  });

  test('the add button creates the category typed in the name field', () => {
    seedBoard();
    render(<App />);

    userEvent.type(screen.getByRole('textbox', { name: CATEGORY_MANAGER_NAME_PLACEHOLDER }), 'home');
    userEvent.click(screen.getByRole('button', { name: CATEGORY_MANAGER_ADD_LABEL }));

    expect(getCategoryTag('home')).toBeInTheDocument();
  });

  test('the new-category color control sets the color of the category that gets created', () => {
    seedBoard();
    render(<App />);

    fireEvent.change(screen.getByLabelText(CATEGORY_MANAGER_NEW_COLOR_LABEL), { target: { value: '#00ff00' } });
    userEvent.type(screen.getByRole('textbox', { name: CATEGORY_MANAGER_NAME_PLACEHOLDER }), 'home');
    userEvent.click(screen.getByRole('button', { name: CATEGORY_MANAGER_ADD_LABEL }));

    expect(getSavedCategory('home').color).toBe('#00ff00');
  });

  test('the color control of a category changes only that category', () => {
    seedBoard();
    render(<App />);

    fireEvent.change(screen.getByLabelText(CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY)), { target: { value: '#ff0000' } });

    expect(getSavedCategory(WORK_CATEGORY).color).toBe('#ff0000');
    expect(getSavedCategory(CATEGORY_GENERAL).color).toBe(DEFAULT_COLOR);
  });
});

describe('deleting a category', () => {
  test('a note added after deleting the category selected in the add form is filed under the general category', () => {
    seedBoard();
    render(<App />);

    userEvent.selectOptions(screen.getByRole('combobox', { name: TASK_INPUT_CATEGORY_LABEL }), WORK_CATEGORY);
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
    userEvent.clear(getSearchField());
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
