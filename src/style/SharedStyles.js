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

// A custom tooltip driven by the data-tooltip attribute: unlike the native `title`
// attribute, this shows on keyboard focus too, not only on real mouse hover.
// Requires `position: relative` on the element itself.
export const hoverFocusTooltip = (align = 'center') => css`
  &::after {
    content: attr(data-tooltip);
    position: absolute;
    top: 100%;
    ${align === 'end'
      ? css`right: 0;`
      : css`left: 50%; transform: translateX(-50%);`}
    margin-top: 6px;
    white-space: nowrap;
    background: #334155;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: normal;
    line-height: 1.4;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
    z-index: 10;
  }

  &:hover::after,
  &:focus-visible::after {
    opacity: 1;
  }
`;

export const BaseButton = styled.button`
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

  padding: ${props => props.$size === 'small' ? '0.5rem' : '1rem'};
  font-size: ${props => props.$size === 'small' ? '0.9rem' : '1.1rem'};

  &:focus {
    border-color: ${PRIMARY_COLOR};
  }
`;