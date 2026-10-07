import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { CATEGORY_GENERAL } from './constants';
import {
  STICKY_NOTE_BOLD_LABEL,
  STICKY_NOTE_ITALIC_LABEL,
  STICKY_NOTE_CATEGORY_LABEL,
  STICKY_NOTE_CHECK_TITLE_COMPLETED,
  STICKY_NOTE_CHECK_TITLE_IN_PROGRESS,
  STICKY_NOTE_CHECK_TITLE_PENDING,
  STICKY_NOTE_DATE_LABEL,
  STICKY_NOTE_MARK_IMPORTANT,
  STICKY_NOTE_TEXT_LABEL,
  STICKY_NOTE_TITLE_PLACEHOLDER,
  STICKY_NOTE_UNMARK_IMPORTANT,
  TODO_APP_FILTER_IMPORTANT_LABEL
} from './ui-texts';
import {
  WORK_CATEGORY,
  makeTask,
  seedBoard,
  getCategoryTag,
  focusElement,
  selectTextRange,
  clickFilter
} from './test-utils/boardTestUtils';

beforeEach(() => {
  localStorage.clear();
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

describe('marking a note as important with its folded corner', () => {
  const seedPlainNote = () => seedBoard({ tasks: [makeTask({ text: 'milk' })] });

  test('the corner marks the note as important and unmarks it again', () => {
    seedPlainNote();
    render(<App />);

    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_MARK_IMPORTANT }));
    expect(screen.queryByRole('button', { name: STICKY_NOTE_MARK_IMPORTANT })).not.toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_UNMARK_IMPORTANT }));
    expect(screen.getByRole('button', { name: STICKY_NOTE_MARK_IMPORTANT })).toBeInTheDocument();
  });

  test('a note shows up under the important filter only after it is marked', () => {
    seedPlainNote();
    render(<App />);

    clickFilter(TODO_APP_FILTER_IMPORTANT_LABEL);
    expect(screen.queryByText('milk')).not.toBeInTheDocument();
    clickFilter(TODO_APP_FILTER_IMPORTANT_LABEL);
    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_MARK_IMPORTANT }));
    clickFilter(TODO_APP_FILTER_IMPORTANT_LABEL);

    expect(screen.getByText('milk')).toBeInTheDocument();
  });

  test('the important mark is kept after a reload', () => {
    seedPlainNote();
    const { unmount } = render(<App />);
    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_MARK_IMPORTANT }));

    unmount();
    render(<App />);

    expect(screen.getByRole('button', { name: STICKY_NOTE_UNMARK_IMPORTANT })).toBeInTheDocument();
  });

  test('the corner works with the keyboard', () => {
    seedPlainNote();
    render(<App />);

    screen.getByRole('button', { name: STICKY_NOTE_MARK_IMPORTANT }).focus();
    userEvent.keyboard('[Enter]');

    expect(screen.getByRole('button', { name: STICKY_NOTE_UNMARK_IMPORTANT })).toBeInTheDocument();
  });

  test('the important control is no longer drawn as a star', () => {
    seedPlainNote();
    const { container } = render(<App />);

    expect(container.querySelector('.lucide-star')).toBeNull();
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

  test('Enter in the note text adds a line break at the caret and stays in edit mode, and Escape exits', () => {
    seedOneNote();
    render(<App />);
    const textField = screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL });

    focusElement(textField);
    selectTextRange(textField, 4, 4); // caret right after "milk"
    userEvent.keyboard('[Enter]');
    expect(textField).toHaveFocus();
    expect(textField.textContent).toBe('milk\n and eggs');

    userEvent.keyboard('[Escape]');
    expect(textField).not.toHaveFocus();
  });

  test('Enter in the title finishes editing, and Shift+Enter is ignored instead of adding a line or exiting', () => {
    seedOneNote();
    render(<App />);
    const titleField = screen.getByRole('textbox', { name: STICKY_NOTE_TITLE_PLACEHOLDER });

    focusElement(titleField);
    userEvent.keyboard('[Enter]');
    expect(titleField).not.toHaveFocus();

    focusElement(titleField);
    userEvent.keyboard('{Shift>}[Enter]{/Shift}');
    expect(titleField).toHaveFocus();
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

  test('the note text shows *bold*/_italic_ markers formatted when not being edited, and raw while editing', () => {
    seedOneNote({ text: 'buy *milk* and _eggs_' });
    render(<App />);
    const textField = screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL });

    expect(textField.querySelector('strong')).toHaveTextContent('milk');
    expect(textField.querySelector('em')).toHaveTextContent('eggs');
    expect(textField.textContent).toBe('buy milk and eggs');

    fireEvent.focus(textField);

    expect(textField.textContent).toBe('buy *milk* and _eggs_');
  });

  test('the format bar appears as soon as the field is focused, before any text is selected, and disappears on blur', () => {
    seedOneNote({ text: 'buy milk today' });
    render(<App />);
    const textField = screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL });

    expect(screen.queryByRole('button', { name: STICKY_NOTE_BOLD_LABEL })).not.toBeInTheDocument();

    focusElement(textField);

    expect(screen.getByRole('button', { name: STICKY_NOTE_BOLD_LABEL })).toBeInTheDocument();

    fireEvent.blur(textField);

    expect(screen.queryByRole('button', { name: STICKY_NOTE_BOLD_LABEL })).not.toBeInTheDocument();
  });

  // Regression (Libi, DevTools mobile-mode keyboard check): Tabbing from the field to
  // the format bar's own Bold button blurs the field, and the bar used to close on any
  // blur - hiding the button, and yanking focus with it, before Enter/Space could ever
  // activate it. A blur whose relatedTarget is inside the bar must leave it open.
  test('Tab from the field into the format bar keeps the bar open instead of closing under the incoming focus', () => {
    seedOneNote({ text: 'buy milk today' });
    render(<App />);
    const textField = screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL });

    focusElement(textField);
    const boldButton = screen.getByRole('button', { name: STICKY_NOTE_BOLD_LABEL });
    fireEvent.blur(textField, { relatedTarget: boldButton });

    expect(boldButton).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STICKY_NOTE_ITALIC_LABEL })).toBeInTheDocument();
  });

  test('clicking bold on a selection wraps it in *bold*', () => {
    seedOneNote({ text: 'buy milk today' });
    render(<App />);
    const textField = screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL });

    focusElement(textField);
    selectTextRange(textField, 4, 8); // "milk"

    const boldButton = screen.getByRole('button', { name: STICKY_NOTE_BOLD_LABEL });
    userEvent.click(boldButton);

    expect(textField.textContent).toBe('buy *milk* today');
  });

  test('selecting text in the note content and choosing italic wraps the selection in _italic_', () => {
    seedOneNote({ text: 'buy milk today' });
    render(<App />);
    const textField = screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL });

    focusElement(textField);
    selectTextRange(textField, 4, 8); // "milk"

    const italicButton = screen.getByRole('button', { name: STICKY_NOTE_ITALIC_LABEL });
    userEvent.click(italicButton);

    expect(textField.textContent).toBe('buy _milk_ today');
  });

  test('clicking bold again on text that includes the markers removes the bold instead of adding more', () => {
    seedOneNote({ text: 'buy *milk* today' });
    render(<App />);
    const textField = screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL });

    focusElement(textField);
    selectTextRange(textField, 4, 10); // "*milk*"
    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_BOLD_LABEL }));

    expect(textField.textContent).toBe('buy milk today');
  });

  test('clicking bold again on just the inner text (markers just outside the selection) also removes the bold', () => {
    seedOneNote({ text: 'buy *milk* today' });
    render(<App />);
    const textField = screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL });

    focusElement(textField);
    selectTextRange(textField, 5, 9); // "milk", without the asterisks
    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_BOLD_LABEL }));

    expect(textField.textContent).toBe('buy milk today');
  });

  test('clicking italic again on an imprecise selection (not aligned to the markers) still removes the italic instead of wrapping again', () => {
    seedOneNote({ text: 'buy _milk_ today' });
    render(<App />);
    const textField = screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL });

    focusElement(textField);
    selectTextRange(textField, 6, 9); // "ilk" - a subset of the italic span, not its exact edges
    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_ITALIC_LABEL }));

    expect(textField.textContent).toBe('buy milk today');
  });

  test('applying bold then italic to the same text combines them', () => {
    seedOneNote({ text: 'buy milk today' });
    render(<App />);
    const textField = screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL });

    focusElement(textField);
    selectTextRange(textField, 4, 8); // "milk"
    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_BOLD_LABEL }));
    expect(textField.textContent).toBe('buy *milk* today');

    selectTextRange(textField, 5, 9); // "milk" inside the asterisks
    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_ITALIC_LABEL }));
    expect(textField.textContent).toBe('buy *_milk_* today');

    fireEvent.blur(textField);

    const strong = textField.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong.querySelector('em')).toHaveTextContent('milk');
  });

  test('Ctrl+B toggles bold on the selection without needing the toolbar', () => {
    seedOneNote({ text: 'buy milk today' });
    render(<App />);
    const textField = screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL });

    focusElement(textField);
    selectTextRange(textField, 4, 8); // "milk"
    userEvent.keyboard('{Control>}b{/Control}');

    expect(textField.textContent).toBe('buy *milk* today');
  });

  test('Ctrl+I toggles italic on the selection without needing the toolbar', () => {
    seedOneNote({ text: 'buy milk today' });
    render(<App />);
    const textField = screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL });

    focusElement(textField);
    selectTextRange(textField, 4, 8); // "milk"
    userEvent.keyboard('{Control>}i{/Control}');

    expect(textField.textContent).toBe('buy _milk_ today');
  });

  test('the title shows *bold*/_italic_ markers formatted when not being edited, and raw while editing', () => {
    seedOneNote({ title: '*urgent* _task_' });
    render(<App />);
    const titleField = screen.getByRole('textbox', { name: STICKY_NOTE_TITLE_PLACEHOLDER });

    expect(titleField.querySelector('strong')).toHaveTextContent('urgent');
    expect(titleField.querySelector('em')).toHaveTextContent('task');

    fireEvent.focus(titleField);

    expect(titleField.textContent).toBe('*urgent* _task_');
  });
});
