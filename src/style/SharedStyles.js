import styled, { css } from 'styled-components';
import { PRIMARY_COLOR, BORDER_LIGHT, TEXT_MAIN } from './style-constants';

export const touchTarget = (extraPx) => css`
  @media (pointer: coarse) {
    &::before {
      content: '';
      position: absolute;
      inset: -${extraPx}px;
    }
  }
`;

export const BaseButton = styled.button`
  /* ערכים קבועים לאחידות */
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Varela Round', sans-serif;

  padding: ${props => props.$size === 'small' ? '0.4rem 0.8rem' : '0.8rem 1.5rem'};
  font-size: ${props => props.$size === 'small' ? '0.9rem' : '1rem'};

  &:active {
    transform: scale(0.98);
  }
`;

export const BaseInput = styled.input`
  border-radius: 12px;
  border: 2px solid ${BORDER_LIGHT};
  font-family: 'Varela Round', sans-serif;
  outline: none;
  color: ${TEXT_MAIN};
  transition: border-color 0.2s;

  /* גמישות - מאפשר להחזיר גודל קטן בלחיצת כפתור */
  padding: ${props => props.$size === 'small' ? '0.5rem' : '1rem'};
  font-size: ${props => props.$size === 'small' ? '0.9rem' : '1.1rem'};

  &:focus {
    border-color: ${PRIMARY_COLOR};
  }
`;