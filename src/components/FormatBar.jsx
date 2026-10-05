import React, { useEffect, useRef } from 'react';
import * as S from '../style/StickyNote.styles';
import { STICKY_NOTE_BOLD_LABEL, STICKY_NOTE_ITALIC_LABEL } from '../ui-texts';

// Shown right under a field whenever it's focused, instead of a toolbar anchored to
// the current text selection: on touch devices the OS's own selection menu (Copy/...)
// draws in about the same spot a selection-anchored toolbar would, hiding it behind
// native UI. An always-visible bar in the normal page flow sidesteps that, and
// showing the same bar on desktop keeps one consistent look everywhere instead of
// two different formatting UIs.
const FormatBar = ({ isEditing, onBold, onItalic, onBlur }) => {
  // preventDefault() on mousedown/touchstart (needed so tapping a button doesn't
  // blur the field - and collapse its selection - before the click/touchend handler
  // gets to read it) can suppress the click some touch browsers would otherwise
  // synthesize afterward. Firing the action directly on touchend sidesteps that, and
  // this timestamp stops it from also firing a second time if a click does still
  // follow (a boolean flag here would be riskier: if the preventDefault'd touchstart
  // ever suppresses that synthetic click entirely, the flag would stay stuck set and
  // silently swallow the *next* unrelated click or keyboard activation too).
  const lastTouchEndRef = useRef(0);
  const barRef = useRef(null);

  // React attaches its onTouchStart prop as a passive listener (so it can never block
  // scrolling), which makes preventDefault() inside it silently do nothing and log a
  // console warning instead. A real DOM listener with { passive: false } is the only
  // way to actually stop the tap from blurring the field before touchend runs.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;
    const handleTouchStart = (e) => e.preventDefault();
    bar.addEventListener('touchstart', handleTouchStart, { passive: false });
    return () => bar.removeEventListener('touchstart', handleTouchStart);
  }, [isEditing]);

  if (!isEditing) return null;

  const bind = (action) => ({
    onMouseDown: (e) => e.preventDefault(),
    onTouchEnd: (e) => {
      e.preventDefault();
      lastTouchEndRef.current = Date.now();
      action();
    },
    onClick: () => {
      // A touch browser's own synthetic click follows touchend within a few hundred
      // ms; outside that window this is a genuine separate click or keyboard
      // activation and must run normally.
      if (Date.now() - lastTouchEndRef.current < 500) return;
      action();
    }
  });

  return (
    <S.FormatBar ref={barRef} data-format-bar onBlur={onBlur}>
      <S.FormatBarButton type="button" aria-label={STICKY_NOTE_BOLD_LABEL} {...bind(onBold)}>
        <strong>B</strong>
      </S.FormatBarButton>
      <S.FormatBarButton type="button" aria-label={STICKY_NOTE_ITALIC_LABEL} {...bind(onItalic)}>
        <em>I</em>
      </S.FormatBarButton>
    </S.FormatBar>
  );
};

export default FormatBar;
