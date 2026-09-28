import React from 'react';
import * as S from '../style/EmptyState.styles';

const EmptyState = ({ icon, title, message, actionLabel, onAction }) => (
  <S.Card role="status">
    {icon && <S.Illustration>{icon}</S.Illustration>}
    <S.Title>{title}</S.Title>
    <S.Message>{message}</S.Message>
    {actionLabel && (
      <S.ActionButton type="button" onClick={onAction}>{actionLabel}</S.ActionButton>
    )}
  </S.Card>
);

export default EmptyState;
