import { parseLocalDate } from './dateFormat';

// Single source of truth for "overdue", shared by the overdue filter and the note's badge
// so the two can never disagree.
export const isTaskOverdue = ({ deadline, completed }) => {
    if (!deadline || completed) return false;
    return parseLocalDate(deadline) < new Date().setHours(0, 0, 0, 0);
};
