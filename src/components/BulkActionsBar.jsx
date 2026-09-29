import React from 'react';
import * as S from '../style/BulkActionsBar.styles';
import {
  CANCEL_LABEL,
  BULK_DELETE_LABEL,
  TODO_APP_BULK_BANNER_SELECTED_COUNT,
  TODO_APP_CHANGE_CATEGORY_OPTION
} from '../ui-texts';

const BulkActionsBar = ({ selectedCount, categories, onBulkDelete, onChangeCategory, onCancel }) => (
  <S.BulkActionBanner>
    <span>{TODO_APP_BULK_BANNER_SELECTED_COUNT(selectedCount)}</span>
    <S.ActionButton $variant="danger" onClick={onBulkDelete}>{BULK_DELETE_LABEL}</S.ActionButton>
    <S.CategorySelect aria-label={TODO_APP_CHANGE_CATEGORY_OPTION} onChange={(e) => onChangeCategory(e.target.value)}>
      <option value="">{TODO_APP_CHANGE_CATEGORY_OPTION}</option>
      {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
    </S.CategorySelect>
    <S.ActionButton onClick={onCancel}>{CANCEL_LABEL}</S.ActionButton>
  </S.BulkActionBanner>
);

export default BulkActionsBar;
