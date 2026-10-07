import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { STORAGE_KEY_TASKS } from './constants';
import {
  STICKY_NOTE_CHECKLIST_ITEM_LABEL,
  STICKY_NOTE_CHECKLIST_ITEM_TEXT_LABEL,
  STICKY_NOTE_CONVERT_TO_CHECKLIST_LABEL,
  STICKY_NOTE_CONVERT_TO_TEXT_LABEL,
  STICKY_NOTE_TEXT_LABEL
} from './ui-texts';
import { makeTask, seedBoard, focusElement, searchFor } from './test-utils/boardTestUtils';

beforeEach(() => {
  localStorage.clear();
});

describe('checklist notes', () => {
  // Each item's text field now has its own unique accessible name (position/total),
  // so they're found by scoping to the list rather than by a single shared name.
  const getItemTextboxes = () => within(screen.getByRole('list')).getAllByRole('textbox');
  const convertToChecklist = () => userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_CONVERT_TO_CHECKLIST_LABEL }));
  const seedChecklistNote = (items) =>
    seedBoard({
      tasks: [makeTask({
        isChecklist: true,
        checklistItems: items.map((item, index) => ({ id: `item-${index}`, checked: false, ...item }))
      })]
    });

  test('converting a note turns each of its lines into a separate checklist item', () => {
    seedBoard({ tasks: [makeTask({ text: 'milk\neggs\nbread' })] });
    render(<App />);

    convertToChecklist();

    expect(getItemTextboxes().map((el) => el.textContent)).toEqual(['milk', 'eggs', 'bread']);
    expect(screen.queryByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL })).not.toBeInTheDocument();
  });

  test('converting skips blank lines and drops the plain-text field', () => {
    seedBoard({ tasks: [makeTask({ text: 'milk\n\n  \neggs' })] });
    render(<App />);

    convertToChecklist();

    expect(getItemTextboxes().map((el) => el.textContent)).toEqual(['milk', 'eggs']);
  });

  test('converting a note with no text starts with one empty item to type into', () => {
    seedBoard({ tasks: [makeTask({ text: '' })] });
    render(<App />);

    convertToChecklist();

    expect(getItemTextboxes()).toHaveLength(1);
    expect(getItemTextboxes()[0]).toHaveTextContent('');
  });

  test('checking an item off is kept after a reload', () => {
    seedChecklistNote([{ text: 'milk' }]);
    const { unmount } = render(<App />);

    userEvent.click(screen.getByRole('checkbox', { name: STICKY_NOTE_CHECKLIST_ITEM_LABEL(1, 1, 'milk') }));
    expect(screen.getByRole('checkbox', { name: STICKY_NOTE_CHECKLIST_ITEM_LABEL(1, 1, 'milk') })).toBeChecked();

    unmount();
    render(<App />);

    expect(screen.getByRole('checkbox', { name: STICKY_NOTE_CHECKLIST_ITEM_LABEL(1, 1, 'milk') })).toBeChecked();
  });

  test('two items with identical text still get distinct, individually findable accessible names', () => {
    seedChecklistNote([{ text: 'milk' }, { text: 'milk' }]);
    render(<App />);

    const first = screen.getByRole('checkbox', { name: STICKY_NOTE_CHECKLIST_ITEM_LABEL(1, 2, 'milk') });
    const second = screen.getByRole('checkbox', { name: STICKY_NOTE_CHECKLIST_ITEM_LABEL(2, 2, 'milk') });

    expect(first).not.toBe(second);
  });

  test('each item text field also gets its own distinct accessible name', () => {
    seedChecklistNote([{ text: 'milk' }, { text: 'milk' }]);
    render(<App />);

    const first = screen.getByRole('textbox', { name: STICKY_NOTE_CHECKLIST_ITEM_TEXT_LABEL(1, 2) });
    const second = screen.getByRole('textbox', { name: STICKY_NOTE_CHECKLIST_ITEM_TEXT_LABEL(2, 2) });

    expect(first).not.toBe(second);
  });

  test('a checklist note is searchable even when it was seeded without a matching text field', () => {
    seedChecklistNote([{ text: 'buy eggs' }]);
    render(<App />);

    searchFor('eggs');

    expect(getItemTextboxes()).toHaveLength(1);
  });

  test('converting to a checklist with the keyboard moves focus to the first item', () => {
    seedBoard({ tasks: [makeTask({ text: 'milk' })] });
    render(<App />);

    focusElement(screen.getByRole('button', { name: STICKY_NOTE_CONVERT_TO_CHECKLIST_LABEL }));
    userEvent.keyboard('[Enter]');

    expect(getItemTextboxes()[0]).toHaveFocus();
  });

  test('converting to a checklist and back keeps the current items as the note text', () => {
    seedBoard({ tasks: [makeTask({ text: 'milk\neggs' })] });
    render(<App />);

    convertToChecklist();
    userEvent.click(screen.getByRole('button', { name: STICKY_NOTE_CONVERT_TO_TEXT_LABEL }));

    expect(screen.getByRole('textbox', { name: STICKY_NOTE_TEXT_LABEL }).textContent).toBe('milk\neggs');
  });

  test('pressing Enter in an item adds a new empty item after it and focuses it', () => {
    seedChecklistNote([{ text: 'milk' }]);
    render(<App />);

    focusElement(getItemTextboxes()[0]);
    userEvent.keyboard('[Enter]');

    const items = getItemTextboxes();
    expect(items).toHaveLength(2);
    expect(items[1]).toHaveTextContent('');
    expect(items[1]).toHaveFocus();
  });

  test('Shift+Enter adds a line break inside the item instead of a new item, and it survives saving', () => {
    seedChecklistNote([{ text: 'milk' }]);
    render(<App />);

    const [itemTextbox] = getItemTextboxes();
    focusElement(itemTextbox);
    // jsdom doesn't place a caret on focus the way a real browser does.
    const caretAtEnd = document.createRange();
    caretAtEnd.selectNodeContents(itemTextbox);
    caretAtEnd.collapse(false);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(caretAtEnd);
    userEvent.keyboard('{Shift>}[Enter]{/Shift}');
    userEvent.keyboard('eggs');
    act(() => { getItemTextboxes()[0].blur(); });

    expect(getItemTextboxes()).toHaveLength(1);
    const [savedTask] = JSON.parse(localStorage.getItem(STORAGE_KEY_TASKS));
    expect(savedTask.checklistItems[0].text).toBe('milk\neggs');
  });

  test('Backspace on an empty item removes it and leaves the previous one ready to type', () => {
    seedChecklistNote([{ text: 'milk' }, { text: '' }]);
    render(<App />);

    focusElement(getItemTextboxes()[1]);
    userEvent.keyboard('[Backspace]');

    const items = getItemTextboxes();
    expect(items.map((el) => el.textContent)).toEqual(['milk']);
    expect(items[0]).toHaveFocus();
  });

  test('Backspace does not remove the only remaining item, even when it is empty', () => {
    seedChecklistNote([{ text: '' }]);
    render(<App />);

    focusElement(getItemTextboxes()[0]);
    userEvent.keyboard('[Backspace]');

    expect(getItemTextboxes()).toHaveLength(1);
  });

  test('the arrow keys move focus between items', () => {
    seedChecklistNote([{ text: 'milk' }, { text: 'eggs' }]);
    render(<App />);

    const items = getItemTextboxes();
    focusElement(items[0]);
    userEvent.keyboard('[ArrowDown]');
    expect(items[1]).toHaveFocus();

    userEvent.keyboard('[ArrowUp]');
    expect(items[0]).toHaveFocus();
  });

  test('a checklist item shows *bold*/_italic_ markers formatted when not being edited, and raw while editing', () => {
    seedChecklistNote([{ text: 'buy *milk*' }]);
    render(<App />);
    const item = getItemTextboxes()[0];

    expect(item.querySelector('strong')).toHaveTextContent('milk');

    fireEvent.focus(item);

    expect(item.textContent).toBe('buy *milk*');
  });
});
