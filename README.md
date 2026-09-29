# לוח שעם | Sticky Notes Board

A personal sticky notes board in Hebrew for organizing everyday tasks in a simple, visual way.

<!-- Replace with your Vercel URL after deployment -->

[Live Demo](https://your-project-name.vercel.app/)

<!-- Add screenshots or a GIF here after deployment -->

<!-- ![Sticky Notes Board screenshot](./docs/screenshot.png) -->

## Features

- Personal welcome screen with a required name
- Create and edit notes directly on the board
- Add titles, content, categories, and due dates
- Turn notes into checklists
- Add bold and italic formatting to note titles, text, and checklist items
- Mark notes as important
- Move tasks through pending, in progress, and completed states
- Search notes by title or content
- Filter by category, importance, status, and overdue date
- Create, recolor, and delete categories
- Select multiple notes to delete or move them to another category
- Empty states for a new board and searches with no results

## Accessibility and UX

The app is built for Hebrew and right-to-left layouts and works on both desktop and mobile screens.

It includes:

- Keyboard support for key actions
- Accessible names for controls and form fields
- Validation errors announced to assistive technology
- Confirmation dialogs with focus management, Escape support, and focus restoration
- Filter controls that announce whether they are active
- Visible keyboard focus states
- Reduced-motion support

## Tech Stack

- React
- styled-components
- localStorage
- React Testing Library
- Create React App

## How It Works

This is a frontend-only project. Notes, categories, and the user's name are stored in the browser using `localStorage`, so there is no backend or database.

The data stays in the browser and origin where it was created. Clearing the site's data will also clear the board, and there is currently no sync between browsers or devices.

The code is split into components for note creation, filters, bulk actions, notes, content editing, and confirmation dialogs. Task state is managed with `useTodoManager`, and `TodoRepository` handles reading from and writing to `localStorage`.

## Run Locally

Make sure you have a recent version of Node.js installed.

```bash
git clone <repository-url>
cd sticky-notes-board
npm install
npm start
```

The app will run at [http://localhost:3000](http://localhost:3000).

## Tests and Production Build

```bash
npm test
npm run build
```
