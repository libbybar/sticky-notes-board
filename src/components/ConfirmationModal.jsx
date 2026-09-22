import React, { useState } from 'react';
import * as S from './ConfirmationModal.styles';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onCancel, 
  onConfirm, 
  title, 
  message, 
  confirmText = "כן, למחוק",
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
            ביטול
          </S.CancelButton>
        </S.ButtonGroup>
      </S.ModalContainer>
    </S.Overlay>
  );
};

export default ConfirmationModal;