import React, { useEffect, useId, useRef } from 'react';
import * as S from '../style/ConfirmationModal.styles';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { CANCEL_LABEL, CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT } from '../ui-texts';

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const ConfirmationModal = ({
  isOpen,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText = CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT,
  variant = "danger"
}) => {
  const titleId = useId();
  const messageId = useId();
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const opener = document.activeElement;
    cancelButtonRef.current?.focus();
    return () => {
      if (opener?.isConnected) opener.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const keepFocusInside = (e) => {
      const controls = dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      const active = document.activeElement;
      const isOutside = !dialogRef.current.contains(active);

      if (isOutside || (e.shiftKey && active === first)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Tab') keepFocusInside(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <S.Overlay onClick={onCancel}>
      <S.ModalContainer
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onClick={e => e.stopPropagation()}
      >
        <S.WarningIcon>
          <AlertTriangle size={48} />
        </S.WarningIcon>

        <S.Title id={titleId}>{title}</S.Title>
        <S.Message id={messageId}>{message}</S.Message>

        <S.ButtonGroup>
          <S.ConfirmButton onClick={onConfirm}>
            <Trash2 size={18} />
            {confirmText}
          </S.ConfirmButton>

          <S.CancelButton ref={cancelButtonRef} onClick={onCancel}>
            <X size={18} />
            {CANCEL_LABEL}
          </S.CancelButton>
        </S.ButtonGroup>
      </S.ModalContainer>
    </S.Overlay>
  );
};

export default ConfirmationModal;
