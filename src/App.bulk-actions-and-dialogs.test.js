import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import {
  BULK_DELETE_LABEL,
  CANCEL_LABEL,
  CATEGORY_MANAGER_DELETE_LABEL,
  CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT,
  STICKY_NOTE_DELETE_TITLE,
  STICKY_NOTE_SELECT_LABEL,
  TODO_APP_BULK_BANNER_SELECTED_COUNT,
  TODO_APP_BULK_DELETE_MESSAGE,
  TODO_APP_CHANGE_CATEGORY_OPTION,
  TODO_APP_CLEAR_BOARD_TOOLTIP,
  TODO_APP_DELETE_CATEGORY_TITLE,
  TODO_APP_DELETE_TASK_TITLE,
  TODO_APP_RESET_MESSAGE,
  TODO_APP_RESET_TITLE,
  TODO_APP_SELECTION_MODE_OFF_LABEL
} from './ui-texts';
import {
  WORK_CATEGORY,
  makeTask,
  seedBoard,
  getCategoryTag,
  getSearchField,
  searchFor
} from './test-utils/boardTestUtils';

beforeEach(() => {
  localStorage.clear();
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

describe('board and category controls are exposed by name', () => {
  test('the reset button is named by its tooltip text and opens the reset confirmation', () => {
    seedBoard();
    render(<App />);

    userEvent.click(screen.getByRole('button', { name: TODO_APP_CLEAR_BOARD_TOOLTIP }));

    expect(screen.getByText(TODO_APP_RESET_TITLE)).toBeInTheDocument();
  });
});
