import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { DEFAULT_COLOR, DEFAULT_BORDER } from './style/style-constants';
import { CATEGORY_GENERAL, STORAGE_KEY_CATEGORIES } from './constants';
import {
  CANCEL_LABEL,
  CATEGORY_MANAGER_ADD_LABEL,
  CATEGORY_MANAGER_COLOR_LABEL,
  CATEGORY_MANAGER_DELETE_LABEL,
  CATEGORY_MANAGER_ERROR_DUPLICATE,
  CATEGORY_MANAGER_ERROR_EMPTY,
  CATEGORY_MANAGER_NAME_PLACEHOLDER,
  CATEGORY_MANAGER_NEW_COLOR_LABEL,
  CATEGORY_COLOR_NAME_PINK,
  CATEGORY_COLOR_NAME_GREEN,
  CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT,
  CREATE_NOTE_CATEGORY_LABEL
} from './ui-texts';
import {
  WORK_CATEGORY,
  makeTask,
  seedBoard,
  getCategoryTag,
  addNote,
  focusElement,
  getSearchField,
  searchFor
} from './test-utils/boardTestUtils';

// The touch-only pastel palette's trigger shares its accessible name with the native
// color input it replaces on touch devices (see CategoryManager.jsx), so both match
// getByLabelText; this picks out the real <input type="color"> that desktop uses.
const getColorInput = (label) =>
  screen.getAllByLabelText(label).find((el) => el.tagName === 'INPUT');

// The pastel palette (CSS-gated to touch devices via `pointer: coarse`, which jsdom
// never matches) is still real markup worth testing - `hidden: true` looks past the
// display:none that hides it from a plain desktop-oriented query.
const getColorPaletteGroup = (label) => screen.getByRole('group', { name: label, hidden: true });

const openCategoryColorPicker = (categoryName) => {
  userEvent.click(screen.getByRole('button', { name: CATEGORY_MANAGER_COLOR_LABEL(categoryName), hidden: true }));
};

const pickPaletteColor = (groupLabel, swatchName) => {
  userEvent.click(within(getColorPaletteGroup(groupLabel)).getByRole('button', { name: swatchName, hidden: true }));
};

const deleteCategory = (name) => {
  userEvent.click(screen.getByRole('button', { name: CATEGORY_MANAGER_DELETE_LABEL(name) }));
  userEvent.click(screen.getByRole('button', { name: CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT }));
};

const getSavedCategory = (name) =>
  JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES)).find((cat) => cat.name === name);

beforeEach(() => {
  localStorage.clear();
});

describe('control states and messages are announced', () => {
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

      userEvent.click(getColorInput(CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY)));

      expect(getCategoryTag(WORK_CATEGORY)).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByText('work note')).toBeInTheDocument();
      expect(screen.getByText('general note')).toBeInTheDocument();
    });

    test('changing a category color leaves the filter and the notes as they were', () => {
      seedWorkAndGeneralNotes();
      render(<App />);
      const colorControl = getColorInput(CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY));

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

describe('board and category controls are exposed by name', () => {
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

    fireEvent.change(getColorInput(CATEGORY_MANAGER_NEW_COLOR_LABEL), { target: { value: '#00ff00' } });
    userEvent.type(screen.getByRole('textbox', { name: CATEGORY_MANAGER_NAME_PLACEHOLDER }), 'home');
    userEvent.click(screen.getByRole('button', { name: CATEGORY_MANAGER_ADD_LABEL }));

    expect(getSavedCategory('home').color).toBe('#00ff00');
  });

  test('the color control of a category changes only that category', () => {
    seedBoard();
    render(<App />);

    fireEvent.change(getColorInput(CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY)), { target: { value: '#ff0000' } });

    expect(getSavedCategory(WORK_CATEGORY).color).toBe('#ff0000');
    expect(getSavedCategory(CATEGORY_GENERAL).color).toBe(DEFAULT_COLOR);
  });
});

describe('touch-only pastel color palette', () => {
  test('the inline palette in the add-form sets the color of the new category', () => {
    seedBoard();
    render(<App />);

    pickPaletteColor(CATEGORY_MANAGER_NEW_COLOR_LABEL, CATEGORY_COLOR_NAME_PINK);
    userEvent.type(screen.getByRole('textbox', { name: CATEGORY_MANAGER_NAME_PLACEHOLDER }), 'home');
    userEvent.click(screen.getByRole('button', { name: CATEGORY_MANAGER_ADD_LABEL }));

    expect(getSavedCategory('home').color.toLowerCase()).toBe('#fbcfe8');
  });

  test('picking a palette color for an existing category updates it, and a note filed under it keeps that category', () => {
    seedBoard({ tasks: [makeTask({ text: 'work note', category: WORK_CATEGORY })] });
    render(<App />);

    openCategoryColorPicker(WORK_CATEGORY);
    pickPaletteColor(CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY), CATEGORY_COLOR_NAME_GREEN);

    expect(getSavedCategory(WORK_CATEGORY).color.toLowerCase()).toBe('#bbf7d0');
    userEvent.click(getCategoryTag(WORK_CATEGORY));
    expect(screen.getByText('work note')).toBeInTheDocument();
  });

  test('picking a palette color closes the popover and returns focus to its trigger', () => {
    seedBoard();
    render(<App />);

    openCategoryColorPicker(WORK_CATEGORY);
    pickPaletteColor(CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY), CATEGORY_COLOR_NAME_GREEN);

    expect(screen.queryByRole('group', { name: CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY), hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY), hidden: true })).toHaveFocus();
  });

  test('Escape closes the popover without changing the color, and returns focus to its trigger', () => {
    seedBoard();
    render(<App />);

    openCategoryColorPicker(WORK_CATEGORY);
    userEvent.keyboard('[Escape]');

    expect(screen.queryByRole('group', { name: CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY), hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY), hidden: true })).toHaveFocus();
    expect(getSavedCategory(WORK_CATEGORY).color).toBe(DEFAULT_COLOR);
  });

  // NOTE: this can't prove the swatch is reachable by a real Tab press. jsdom never
  // matches `(pointer: coarse)`, so the whole palette's wrapper genuinely computes to
  // display:none here - unlike the direct .focus() calls this suite uses elsewhere
  // (jsdom allows those regardless of display), userEvent.tab() correctly treats a
  // display:none subtree as untabbable and skips straight past it. So this only shows
  // that Enter activates a swatch once focus reaches it some other way; real Tab
  // reachability needs a manual check on an actual touch device.
  test('a swatch responds to Enter once it has focus', () => {
    seedBoard();
    render(<App />);

    focusElement(screen.getByRole('button', { name: CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY), hidden: true }));
    userEvent.keyboard('[Enter]');
    const swatch = within(getColorPaletteGroup(CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY)))
      .getByRole('button', { name: CATEGORY_COLOR_NAME_PINK, hidden: true });
    focusElement(swatch);
    userEvent.keyboard('[Enter]');

    expect(getSavedCategory(WORK_CATEGORY).color.toLowerCase()).toBe('#fbcfe8');
  });

  test('a category\'s existing custom color is left untouched until a palette color is actually picked', () => {
    seedBoard({ categories: [] });
    localStorage.setItem(
      STORAGE_KEY_CATEGORIES,
      JSON.stringify([
        { name: CATEGORY_GENERAL, color: DEFAULT_COLOR, borderColor: DEFAULT_BORDER },
        { name: WORK_CATEGORY, color: '#123456', borderColor: '#123456' }
      ])
    );
    render(<App />);

    openCategoryColorPicker(WORK_CATEGORY);

    const group = getColorPaletteGroup(CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY));
    within(group).getAllByRole('button', { hidden: true }).forEach((swatch) => {
      expect(swatch).toHaveAttribute('aria-pressed', 'false');
    });
    expect(getSavedCategory(WORK_CATEGORY).color).toBe('#123456');
  });

  test('a palette color picked for a category survives a reload, and the reopened picker shows it selected', () => {
    seedBoard();
    const { unmount } = render(<App />);

    openCategoryColorPicker(WORK_CATEGORY);
    pickPaletteColor(CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY), CATEGORY_COLOR_NAME_GREEN);

    unmount();
    render(<App />);

    expect(getSavedCategory(WORK_CATEGORY).color.toLowerCase()).toBe('#bbf7d0');
    openCategoryColorPicker(WORK_CATEGORY);
    const greenSwatch = within(getColorPaletteGroup(CATEGORY_MANAGER_COLOR_LABEL(WORK_CATEGORY)))
      .getByRole('button', { name: CATEGORY_COLOR_NAME_GREEN, hidden: true });
    expect(greenSwatch).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('deleting a category', () => {
  test('a note added after deleting the category selected in the add form is filed under the general category', () => {
    seedBoard();
    render(<App />);

    userEvent.selectOptions(screen.getByRole('combobox', { name: CREATE_NOTE_CATEGORY_LABEL }), WORK_CATEGORY);
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
