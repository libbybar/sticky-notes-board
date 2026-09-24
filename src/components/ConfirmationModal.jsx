import React from 'react';
import * as S from '../style/ConfirmationModal.styles';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { CANCEL_LABEL, CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT } from '../ui-texts';

const ConfirmationModal = ({
  isOpen,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText = CONFIRMATION_MODAL_DEFAULT_CONFIRM_TEXT,
  variant = "danger"
}) => {
  if (!isOpen) return null;

  return (
    <S.Overlay onClick={onCancel}>
      <S.ModalContainer onClick={e => e.stopPropagation()}>
        <S.WarningIcon>
          <AlertTriangle size={48} />
        </S.WarningIcon>
        
        <S.Title>{title}</S.Title>
        <S.Message>{message}</S.Message>
        
        <S.ButtonGroup>
          <S.ConfirmButton onClick={onConfirm}>
            <Trash2 size={18} />
            {confirmText}
          </S.ConfirmButton>
          
          <S.CancelButton onClick={onCancel}>
            <X size={18} />
            {CANCEL_LABEL}
          </S.CancelButton>
        </S.ButtonGroup>
      </S.ModalContainer>
    </S.Overlay>
  );
};

export default ConfirmationModal;