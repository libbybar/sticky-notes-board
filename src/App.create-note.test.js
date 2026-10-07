import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { CATEGORY_GENERAL } from './constants';
import {
  CREATE_NOTE_HEADING,
  CREATE_NOTE_TITLE_LABEL,
  STICKY_NOTE_BOLD_LABEL,
  STICKY_NOTE_ITALIC_LABEL,
  STICKY_NOTE_DELETE_TITLE,
  STICKY_NOTE_TEXT_LABEL,
  CREATE_NOTE_CATEGORY_LABEL,
  CREATE_NOTE_DATE_LABEL,
  CREATE_NOTE_ERROR_EMPTY,
  CREATE_NOTE_SUBMIT_BUTTON,
  TODO_APP_EMPTY_BOARD_TITLE
} from './ui-texts';
import {
  WORK_CATEGORY,
  seedBoard,
  getCategoryTag,
  getCreateNoteContentField,
  addNote,
  focusElement,
  selectTextRange
} from './test-utils/boardTestUtils';

const getNoteDeleteButtons = () => screen.queryAllByRole('button', { name: STICKY_NOTE_DELETE_TITLE });

beforeEach(() => {
  localStorage.clear();
});

describe('adding a note', () => {
  test('shows the new note and clears the text field', () => {
    seedBoard();
    render(<App />);

    addNote('buy milk');

    expect(screen.getByText('buy milk')).toBeInTheDocument();
    expect(getCreateNoteContentField().textContent).toBe('');
  });

  test('rejects text made only of spaces and explains why', () => {
    seedBoard();
    render(<App />);

    addNote('   ');

    expect(screen.getByText(CREATE_NOTE_ERROR_EMPTY)).toBeInTheDocument();
    expect(getNoteDeleteButtons()).toHaveLength(0);
  });

  test('files the note under the category chosen in the form', () => {
    seedBoard();
    render(<App />);

    userEvent.selectOptions(screen.getByRole('combobox', { name: CREATE_NOTE_CATEGORY_LABEL }), WORK_CATEGORY);
    addNote('work item');
    userEvent.click(getCategoryTag(CATEGORY_GENERAL));
    expect(screen.queryByText('work item')).not.toBeInTheDocument();
    userEvent.click(getCategoryTag(WORK_CATEGORY));

    expect(screen.getByText('work item')).toBeInTheDocument();
  });

  test('keeps the deadline chosen in the form on the new note', () => {
    seedBoard();
    render(<App />);

    fireEvent.change(screen.getByLabelText(CREATE_NOTE_DATE_LABEL), { target: { value: '2030-01-15' } });
    addNote('pay rent');

    expect(screen.getByDisplayValue('2030-01-15')).toBeInTheDocument();
  });

  // "2030-01-15" has no time of day, so it must never be run through a UTC parse -
  // that shifts the displayed day back by one in any timezone behind UTC.
  test('shows the deadline\'s own day regardless of the browser timezone', () => {
    const originalTZ = process.env.TZ;
    process.env.TZ = 'Pacific/Midway'; // UTC-11
    try {
      seedBoard();
      render(<App />);

      fireEvent.change(screen.getByLabelText(CREATE_NOTE_DATE_LABEL), { target: { value: '2030-01-15' } });
      addNote('pay rent');

      expect(screen.getByText('15.1.2030')).toBeInTheDocument();
    } finally {
      process.env.TZ = originalTZ;
    }
  });
});

describe('the create-note card', () => {
  test('shows its heading and exposes the title and content fields by name', () => {
    seedBoard();
    render(<App />);

    expect(screen.getByText(CREATE_NOTE_HEADING)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: CREATE_NOTE_TITLE_LABEL })).toBeInTheDocument();
    expect(getCreateNoteContentField()).toBeInTheDocument();
  });

  test('Enter in the content field adds a line break instead of submitting the note', () => {
    seedBoard();
    render(<App />);
    const contentField = getCreateNoteContentField();

    userEvent.type(contentField, 'milk{enter}eggs');

    expect(contentField.textContent).toBe('milk\neggs');
    expect(screen.getByText(TODO_APP_EMPTY_BOARD_TITLE)).toBeInTheDocument();
  });

  test('clicking the submit button adds the note and resets the card for the next one', () => {
    seedBoard();
    render(<App />);

    userEvent.type(screen.getByRole('textbox', { name: CREATE_NOTE_TITLE_LABEL }), 'groceries');
    addNote('buy milk');

    expect(screen.getByText('groceries')).toBeInTheDocument();
    expect(screen.getByText('buy milk')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: CREATE_NOTE_TITLE_LABEL }).textContent).toBe('');
    expect(getCreateNoteContentField().textContent).toBe('');
  });

  // Regression (Moriya, mobile DevTools emulation): typing and tapping "Submit" while
  // the field is still focused added nothing, because submit read `text`/`title` state
  // that's only synced on blur, and a touch tap doesn't reliably blur the field before
  // the click handler runs. userEvent.type leaves the field focused (typing alone never
  // blurs it), and fireEvent.click (unlike userEvent.click) never simulates a blur of
  // its own either - so this reproduces the race: the field is still focused, and its
  // content was never synced to state, when submit fires.
  test('submitting while the content field is still focused (never blurred) still adds the note', () => {
    seedBoard();
    render(<App />);
    const contentField = getCreateNoteContentField();

    userEvent.type(contentField, 'buy milk');
    fireEvent.click(screen.getByRole('button', { name: CREATE_NOTE_SUBMIT_BUTTON }));
    expect(screen.getByText('buy milk')).toBeInTheDocument();
  });

  // Regression (Libi, DevTools mobile-mode check): a submit that fires without the
  // content field ever blurring also never closes its format bar (isEditing lives in a
  // hook on CreateNote itself, which a remounted field doesn't reset). Without an
  // explicit reset, the bar would reappear open next to the freshly emptied field.
  test('submitting without blurring first does not leave the format bar open next to the reset field', () => {
    seedBoard();
    render(<App />);
    const contentField = getCreateNoteContentField();

    userEvent.type(contentField, 'buy milk');
    fireEvent.click(screen.getByRole('button', { name: CREATE_NOTE_SUBMIT_BUTTON }));

    expect(screen.queryByRole('button', { name: STICKY_NOTE_BOLD_LABEL })).not.toBeInTheDocument();
  });

  test('a note added from the create-note card keeps its title and content after a reload', () => {
    seedBoard();
    const { unmount } = render(<App />);

    userEvent.type(screen.getByRole('textbox', { name: CREATE_NOTE_TITLE_LABEL }), 'groceries');
    addNote('buy milk');

    unmount();
    render(<App />);

    expect(screen.getByText('groceries')).toBeInTheDocument();
    expect(screen.getByText('buy milk')).toBeInTheDocument();
  });

  test('the format bar appears for the title and content fields once each is focused', () => {
    seedBoard();
    render(<App />);
    const titleField = screen.getByRole('textbox', { name: CREATE_NOTE_TITLE_LABEL });
    const contentField = getCreateNoteContentField();

    expect(screen.queryByRole('button', { name: STICKY_NOTE_BOLD_LABEL })).not.toBeInTheDocument();

    focusElement(titleField);
    expect(screen.getByRole('button', { name: STICKY_NOTE_BOLD_LABEL })).toBeInTheDocument();
    fireEvent.blur(titleField);
    expect(screen.queryByRole('button', { name: STICKY_NOTE_BOLD_LABEL })).not.toBeInTheDocument();

    focusElement(contentField);
    expect(screen.getByRole('button', { name: STICKY_NOTE_ITALIC_LABEL })).toBeInTheDocument();
  });

  test('bolding text before saving carries the *bold* marker onto the new note', () => {
    seedBoard();
    render(<App />);
    const contentField = getCreateNoteContentField();

    // A single direct assignment (rather than userEvent.type, which can split typed
    // text across more than one text node) guarantees contentField.firstChild is the
    // one text node selectTextRange expects - matching how every other such test
    // seeds its field via real note data instead of simulated keystrokes.
    focusElement(contentField);
    act(() => { contentField.textContent = 'buy milk today'; });
    selectTextRange(contentField, 4, 8); // "milk"
    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_BOLD_LABEL }));
    userEvent.click(screen.getByRole('button', { name: CREATE_NOTE_SUBMIT_BUTTON }));

    const savedTextField = screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL });
    expect(savedTextField.querySelector('strong')).toHaveTextContent('milk');
  });
});

describe('control states and messages are announced', () => {
  test('the empty note text error is announced as an alert', () => {
    seedBoard();
    render(<App />);

    addNote('   ');

    expect(screen.getByRole('alert')).toHaveTextContent(CREATE_NOTE_ERROR_EMPTY);
  });
});
