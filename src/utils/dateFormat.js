// Deadlines are stored as plain "YYYY-MM-DD" strings with no time or timezone.
// new Date("YYYY-MM-DD") parses that as UTC midnight, so comparing or formatting it
// in a timezone behind UTC can land on the previous day. Building the Date from its
// year/month/day parts instead treats them as a local calendar date, so neither the
// displayed day nor an "is it over yet" comparison ever shifts.
export const parseLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export const formatDeadline = (dateStr, locale = 'he-IL') => parseLocalDate(dateStr).toLocaleDateString(locale);
