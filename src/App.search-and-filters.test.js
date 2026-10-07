import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import {
  STICKY_NOTE_TEXT_LABEL,
  TODO_APP_CLEAR_FILTERS_LABEL,
  TODO_APP_EMPTY_BOARD_MESSAGE,
  TODO_APP_EMPTY_BOARD_TITLE,
  TODO_APP_FILTER_COMPLETED_LABEL,
  TODO_APP_FILTER_IMPORTANT_LABEL,
  TODO_APP_FILTER_IN_PROGRESS_LABEL,
  TODO_APP_FILTER_OVERDUE_LABEL,
  TODO_APP_NO_RESULTS_MESSAGE,
  TODO_APP_NO_RESULTS_TITLE
} from './ui-texts';
import {
  WORK_CATEGORY,
  makeTask,
  seedBoard,
  getCategoryTag,
  getSearchField,
  searchFor,
  clickFilter
} from './test-utils/boardTestUtils';

const PAST_DEADLINE = '2000-01-01';
const FUTURE_DEADLINE = '2999-01-01';

beforeEach(() => {
  localStorage.clear();
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

  test('the completed filter shows only finished notes', () => {
    seedBoard({
      tasks: [
        makeTask({ text: 'finished note', status: 'completed', completed: true }),
        makeTask({ text: 'unfinished note' })
      ]
    });
    render(<App />);

    clickFilter(TODO_APP_FILTER_COMPLETED_LABEL);

    expect(screen.getByText('finished note')).toBeInTheDocument();
    expect(screen.queryByText('unfinished note')).not.toBeInTheDocument();
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

  // Regression (Moriya/Libi, reproduced for 2026-10-04 in Los Angeles): a deadline of
  // "today" was parsed as UTC midnight and compared against local midnight, so west of
  // UTC a note due today could already show as overdue hours before the day was over.
  test('a note due today is never overdue, even in a timezone behind UTC', () => {
    const originalTZ = process.env.TZ;
    process.env.TZ = 'America/Los_Angeles';
    try {
      const now = new Date();
      const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      seedBoard({ tasks: [makeTask({ text: 'due today', deadline: todayLocal })] });
      render(<App />);

      clickFilter(TODO_APP_FILTER_OVERDUE_LABEL);

      expect(screen.queryByText('due today')).not.toBeInTheDocument();
    } finally {
      process.env.TZ = originalTZ;
    }
  });
});

describe('note display order', () => {
  test('completed notes are always shown last, regardless of their own deadline', () => {
    seedBoard({
      tasks: [
        makeTask({ text: 'done soonest', status: 'completed', completed: true, deadline: PAST_DEADLINE }),
        makeTask({ text: 'future note', deadline: FUTURE_DEADLINE }),
        makeTask({ text: 'no deadline note' })
      ]
    });
    render(<App />);

    const noteTexts = screen.getAllByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL }).map((el) => el.textContent);

    expect(noteTexts).toEqual(['future note', 'no deadline note', 'done soonest']);
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

describe('control states and messages are announced', () => {
  test.each([
    ['important', TODO_APP_FILTER_IMPORTANT_LABEL],
    ['in-progress', TODO_APP_FILTER_IN_PROGRESS_LABEL],
    ['overdue', TODO_APP_FILTER_OVERDUE_LABEL],
    ['completed', TODO_APP_FILTER_COMPLETED_LABEL]
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
});
