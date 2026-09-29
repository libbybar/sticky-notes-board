// Deadlines are stored as plain "YYYY-MM-DD" strings with no time or timezone.
// new Date("YYYY-MM-DD") parses that as UTC midnight, so formatting it with
// toLocaleDateString in a timezone behind UTC can display the previous day.
// Building the Date from its year/month/day parts instead treats them as a
// local calendar date, so the displayed day never shifts.
export const formatDeadline = (dateStr, locale = 'he-IL') => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(locale);
};
