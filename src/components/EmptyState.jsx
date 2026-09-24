import React from 'react';
import * as S from '../style/EmptyState.styles';

const EmptyState = ({ title, message, actionLabel, onAction }) => (
  <S.Card role="status">
    <S.Title>{title}</S.Title>
    <S.Message>{message}</S.Message>
    {actionLabel && (
      <S.ActionButton type="button" onClick={onAction}>{actionLabel}</S.ActionButton>
    )}
  </S.Card>
);

export default EmptyState;
