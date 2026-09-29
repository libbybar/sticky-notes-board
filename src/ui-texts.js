// טקסטים משותפים
export const CANCEL_LABEL = 'ביטול';
export const BULK_DELETE_LABEL = 'מחיקה קבוצתית';

// Header.jsx
export const HEADER_GREETING_PREFIX = 'שלום, ';
export const HEADER_SUBTITLE = 'מה נדביק על הלוח היום?';

// Login.jsx
export const LOGIN_TITLE = 'שלום לך';
export const LOGIN_SUBTITLE = 'איך קוראים לך?';
export const LOGIN_INTRO = 'לוח שעם אישי לפתקים, עם תוויות צבעוניות, תאריכי יעד וחיפוש.';
export const LOGIN_NAME_PLACEHOLDER = 'פה המקום להכניס שם';
export const LOGIN_NAME_ERROR = 'נדרש שם של שני תווים לפחות.';
export const LOGIN_STORAGE_NOTICE = 'השם והפתקים נשמרים בדפדפן הזה בלבד, בלי סנכרון בין מכשירים.';
export const LOGIN_SUBMIT_BUTTON = 'ללוח שלי';

// TaskInput.jsx
export const TASK_INPUT_ERROR_EMPTY = 'נדרש טקסט כדי להדביק פתק';
export const TASK_INPUT_PLACEHOLDER = 'מה נדביק על הלוח?';
export const TASK_INPUT_SUBMIT_BUTTON = 'להדביק';
export const TASK_INPUT_DATE_LABEL = 'תאריך יעד לפתק החדש';
export const TASK_INPUT_CATEGORY_LABEL = 'תווית לפתק החדש';

// CategoryManager.jsx
export const CATEGORY_MANAGER_ERROR_EMPTY = 'יש להזין טקסט עבור התווית';
export const CATEGORY_MANAGER_ERROR_DUPLICATE = (name) => `כבר קיימת תווית בשם "${name}"`;
export const CATEGORY_MANAGER_NAME_PLACEHOLDER = 'שם קטגוריה חדשה';
export const CATEGORY_MANAGER_DELETE_LABEL = (name) => `מחיקת התווית ${name}`;
export const CATEGORY_MANAGER_COLOR_LABEL = (name) => `שינוי צבע של התווית ${name}`;
export const CATEGORY_MANAGER_ADD_LABEL = 'הוספת תווית';
export const CATEGORY_MANAGER_NEW_COLOR_LABEL = 'בחירת צבע לתווית החדשה';

// StickyNote.jsx + StickyNote.styles.js
export const STICKY_NOTE_DELETE_TITLE = 'מחיקה';
export const STICKY_NOTE_MARK_IMPORTANT = 'סימון כדחוף';
export const STICKY_NOTE_UNMARK_IMPORTANT = 'להסיר סימון כדחוף';
export const STICKY_NOTE_NO_DEADLINE_LABEL = 'להוספת תאריך';
export const STICKY_NOTE_OVERDUE_BADGE = 'באיחור!';
export const STICKY_NOTE_CREATED_AT = (dateStr) => `נוצר ב: ${dateStr}`;
export const STICKY_NOTE_CHECK_TITLE_PENDING = "לסמן כ-'בביצוע'";
export const STICKY_NOTE_CHECK_TITLE_IN_PROGRESS = "לסמן כ-'בוצע'";
export const STICKY_NOTE_CHECK_TITLE_COMPLETED = 'משימה הושלמה (לחיצה נוספת לאיפוס)';
export const STICKY_NOTE_TITLE_PLACEHOLDER = 'כותרת';
export const STICKY_NOTE_DATE_LABEL = 'תאריך יעד';
export const STICKY_NOTE_CATEGORY_LABEL = 'תווית הפתק';
export const STICKY_NOTE_TEXT_LABEL = 'תוכן הפתק';
export const STICKY_NOTE_SELECT_LABEL = 'בחירת הפתק';

export const STICKY_NOTE_CONVERT_TO_CHECKLIST_LABEL = 'להפוך לרשימה';
export const STICKY_NOTE_CONVERT_TO_TEXT_LABEL = 'חזרה לפתק רגיל';
export const STICKY_NOTE_CHECKLIST_ITEM_LABEL = (position, total, text) => `סימון פריט ${position} מתוך ${total}: "${text}" כבוצע`;
export const STICKY_NOTE_CHECKLIST_ITEM_TEXT_LABEL = (position, total) => `פריט ${position} מתוך ${total} ברשימה`;

export const STICKY_NOTE_BOLD_LABEL = 'הדגשת הטקסט שנבחר';
export const STICKY_NOTE_ITALIC_LABEL = 'הטיית הטקסט שנבחר';

// ConfirmationModal.jsx
export const CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT = 'כן, למחוק';

// TodoApp.js
export const TODO_APP_CLEAR_BOARD_TOOLTIP = 'איפוס לוח';
export const TODO_APP_DELETE_TASK_TITLE = 'למחוק את הפתק?';
export const TODO_APP_DELETE_TASK_MESSAGE_PREFIX = 'הפעולה תמחק לצמיתות את הפתק:';
export const TODO_APP_DELETE_CATEGORY_TITLE = 'למחוק את התווית?';
export const TODO_APP_DELETE_CATEGORY_CONFIRM_PREFIX = 'נא לאשר שברצונך למחוק את התווית ';
export const TODO_APP_DELETE_CATEGORY_KEPT_NOTICE = (generalCategoryName) =>
  `הפתקים שבה לא יימחקו — הם יעברו לתווית "${generalCategoryName}".`;
export const TODO_APP_RESET_TITLE = 'איפוס כל הלוח?';
export const TODO_APP_RESET_MESSAGE = 'זהירות! פעולה זו תמחק את כל התוויות, הפתקים והגדרות שלך.';
export const TODO_APP_RESET_CONFIRM_TEXT = 'כן, למחוק הכל';
export const TODO_APP_BULK_DELETE_MESSAGE = (count) => `האם למחוק את ${count} הפתקים שנבחרו?`;
export const TODO_APP_SEARCH_PLACEHOLDER = 'חיפוש פתק - לפי כותרת או תוכן';
export const TODO_APP_FILTER_IMPORTANT_LABEL = 'דחופות';
export const TODO_APP_FILTER_IN_PROGRESS_LABEL = 'בביצוע';
export const TODO_APP_FILTER_OVERDUE_LABEL = 'באיחור';
export const TODO_APP_FILTER_COMPLETED_LABEL = 'בוצעו';
export const TODO_APP_SELECTION_MODE_ON_LABEL = 'סיום בחירה';
export const TODO_APP_SELECTION_MODE_OFF_LABEL = 'בחירה מרובה';
export const TODO_APP_BULK_BANNER_SELECTED_COUNT = (count) => `בחרתי ${count} פתקים`;
export const TODO_APP_CHANGE_CATEGORY_OPTION = 'שינוי תווית';
export const TODO_APP_EMPTY_BOARD_TITLE = 'הלוח עוד ריק';
export const TODO_APP_EMPTY_BOARD_MESSAGE =
  `נדביק את הפתק הראשון? אפשר לכתוב אותו בשדה שמעל וללחוץ על "${TASK_INPUT_SUBMIT_BUTTON}".`;
export const TODO_APP_NO_RESULTS_TITLE = 'לא נמצאו פתקים';
export const TODO_APP_NO_RESULTS_MESSAGE = 'אף פתק לא מתאים לחיפוש או לסינון שנבחרו.';
export const TODO_APP_CLEAR_FILTERS_LABEL = 'ניקוי חיפוש וסינון';
