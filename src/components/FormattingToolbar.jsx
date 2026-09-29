import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import * as S from '../style/StickyNote.styles';
import { STICKY_NOTE_BOLD_LABEL, STICKY_NOTE_ITALIC_LABEL } from '../ui-texts';

// Selecting text inside a rotated/scaled note (NoteContainer has a CSS transform) would break
// position: fixed math if rendered in place - a transform creates a new containing block for
// fixed-position descendants. Portaling to document.body keeps the toolbar truly viewport-fixed.
const TOOLBAR_MARGIN = 8;
const TOOLBAR_HALF_WIDTH = 60;
const TOOLBAR_HEIGHT = 40;

const FormattingToolbar = ({ rect, onBold, onItalic }) => {
  // preventDefault() on touchstart (needed so tapping the toolbar doesn't blur/collapse the
  // field's selection first) can suppress the click some touch browsers would otherwise
  // synthesize afterward. Firing the action directly on touchend sidesteps that, and this
  // flag stops it from also firing a second time if a click does still follow.
  const touchHandledRef = useRef(false);

  if (!rect) return null;

  const left = Math.min(
    Math.max(rect.left + rect.width / 2, TOOLBAR_HALF_WIDTH),
    window.innerWidth - TOOLBAR_HALF_WIDTH
  );
  // Flips below the selection when there isn't room above (e.g. a note scrolled near the
  // top of the viewport), so the toolbar doesn't render off-screen.
  const showBelow = rect.top < TOOLBAR_HEIGHT + TOOLBAR_MARGIN;
  const style = showBelow
    ? { top: rect.bottom + TOOLBAR_MARGIN, left, transform: 'translate(-50%, 0)' }
    : { top: rect.top - TOOLBAR_MARGIN, left, transform: 'translate(-50%, -100%)' };

  const bind = (action) => ({
    onTouchEnd: (e) => {
      e.preventDefault();
      touchHandledRef.current = true;
      action();
    },
    onClick: () => {
      if (touchHandledRef.current) {
        touchHandledRef.current = false;
        return;
      }
      action();
    }
  });

  return createPortal(
    <S.FormatToolbar
      style={style}
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
    >
      <S.FormatToolbarButton type="button" aria-label={STICKY_NOTE_BOLD_LABEL} {...bind(onBold)}>
        <strong>B</strong>
      </S.FormatToolbarButton>
      <S.FormatToolbarButton type="button" aria-label={STICKY_NOTE_ITALIC_LABEL} {...bind(onItalic)}>
        <em>I</em>
      </S.FormatToolbarButton>
    </S.FormatToolbar>,
    document.body
  );
};

export default FormattingToolbar;
