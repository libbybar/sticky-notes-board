import styled from 'styled-components';
import { touchTarget } from './SharedStyles';
import { TODO_APP_CLEAR_BOARD_TOOLTIP } from '../ui-texts';
import myBackgroundImage from '../assets/my-background.jpeg';

export const AppContainer = styled.div`
  min-height: 100vh;  padding: 2rem;
  background: radial-gradient(circle at top right, #fdf2ff, #f0f4ff, #fff5f5);
  direction: rtl;

  @media (max-width: 600px) {
    padding: 2.5rem 1rem 1rem;
  }
`;
export const NotesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 3rem 2rem;
  position: relative;

  @media (max-width: 600px) {
    gap: 1rem;
    margin: 1rem auto;
    padding: 2rem 0.75rem;
  }

  background-color: #bc8f6f;
  background-image:
   url(${myBackgroundImage}),
    radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 100%);
border: 12px solid #5d4037;
  border-radius: 8px;

  @media (max-width: 600px) {
    border-width: 8px;
  }
  box-shadow:
    inset 0 0 30px rgba(0,0,0,0.3),
    0 10px 30px rgba(0,0,0,0.15);

    filter: ${props => props.$isSelectionMode ? 'brightness(0.9) contrast(1.1)' : 'none'};
  transition: all 0.4s ease;

`;
export const ClearBoardButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #64748b;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  z-index: 100;
  ${touchTarget(8)}

  &:hover {
    background: #fee2e2;
    color: #ef4444;
    border-color: #fecaca;
  }

  &:after {
    content: '${TODO_APP_CLEAR_BOARD_TOOLTIP}';
    position: absolute;
    right: 30px;
    white-space: nowrap;
    background: #334155;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }

  &:hover:after {
    opacity: 1;
  }
`;
