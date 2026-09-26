import styled, { keyframes } from 'styled-components';
import {
  DEFAULT_COLOR, PRIMARY_COLOR, DANGER_COLOR, TEXT_MAIN,
  TEXT_MUTED, WARNING_COLOR, SUCCESS_COLOR
} from './style-constants';
import { STICKY_NOTE_TITLE_PLACEHOLDER } from '../ui-texts';
import { touchTarget } from './SharedStyles';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
export const NoteContainer = styled.div`
    padding: 1.2rem;
    height: 18rem;
    width: 100%;
    max-width: 260px;
    direction: rtl;
    display: flex;
    overflow: visible;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    cursor: default;
    margin: 1rem;

    @media (max-width: 600px) {
      margin: 0.5rem auto;
    }

    z-index: ${props => props.$isSelected ? 10 : 1};
    background-color: ${props => props.$bgColor || DEFAULT_COLOR};
    border-top: 8px solid rgba(0, 0, 0, 0.1);
    
    transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
    transform: rotate(${props => props.$rotation || 0}deg) 
               scale(${props => props.$isSelected ? 1.05 : 1});
               
    outline: ${props => props.$isSelected ? `3px solid ${PRIMARY_COLOR}` : 'none'};
    outline-offset: 4px;
    box-shadow: ${props => props.$isSelected
      ? `0 20px 40px rgba(79, 70, 229, 0.4)`
      : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'};

    animation: ${fadeIn} 0.4s ease-out forwards;
    
    &:hover {
      transform: scale(1.05) rotate(0deg);
      z-index: 50;
      box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
    }

    opacity: ${props => props.$isSelectionMode && !props.$isSelected ? 0.6 : 1};
    filter: ${props => props.$isSelectionMode && !props.$isSelected ? 'grayscale(30%)' : 'none'};
`;
export const NoteHeaderArea = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.4rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
`;
export const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
export const CategoryTag = styled.select`
    font-size: 10px;
    font-weight: 800;
    color: ${TEXT_MUTED};
    text-transform: uppercase;
    font-family: 'Varela Round', sans-serif;
    background: rgba(255, 255, 255, 0.3);
    padding: 1px 5px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    outline: none;
    appearance: none;
    min-width: 0;
    max-width: 9rem;
    text-overflow: ellipsis;

    @media (pointer: coarse) {
      padding: 9px 5px;
      margin: -8px 0;
    }
`;
export const DeleteBtn = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    padding: 4px;
    transition: color 0.2s;
    position: relative;
    ${touchTarget(9)}
    &:hover { color: ${DANGER_COLOR}; }
`;
export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
`;
export const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: ${props => props.$isImportant ? WARNING_COLOR : '#e2e8f0'};
  transition: all 0.2s;

  &:hover {
    transform: scale(1.2);
    color: ${WARNING_COLOR};
  }
`;
export const TitleInput = styled.div`
  font-weight: bold;
  font-size: 1rem;
  font-family: 'Varela Round', sans-serif;
  outline: none;
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  unicode-bidi: plaintext;
  color: ${TEXT_MAIN};
  min-height: 1.2rem;
  max-height: 3.2rem;
  overflow-y: auto;
  text-decoration: ${props => props.$isCompleted ? 'line-through' : 'none'};

  &:empty::before {
    content: "${STICKY_NOTE_TITLE_PLACEHOLDER}";
    color: #94a3b8;
    font-weight: normal; 
  }
`;
export const ContentArea = styled.div`
  flex: 1;
  height: 9.5rem;
  min-height: 4rem;
  overflow-y: auto; 
  overflow-x: hidden;
  margin: 0.3rem 0;
  display: block;
  direction: ltr;
  text-align: right;
  padding-left: 4px; 
  padding-right: 10px;
  scrollbar-gutter: stable;

  &::-webkit-scrollbar { width: 3.5px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
`;
export const TaskText = styled.div`
    font-family: 'Assistant', sans-serif;
    font-weight: 300; 
    font-style: italic;
    font-size: 1.3rem;
    line-height: 1.4;
    color: ${TEXT_MAIN};
    margin: 0;
    word-wrap: break-word;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    outline: none;
    text-align: start;
    direction: rtl;
    unicode-bidi: plaintext;
    text-decoration: ${props => props.$isCompleted ? 'line-through' : 'none'};
    opacity: ${props => props.$isCompleted ? 0.4 : 1};
    transition: all 0.3s ease;

    &:focus {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
`;
export const PinWrapper = styled.div`
    position: absolute;
    top: -18px;
    z-index: 20;
    left: 50%;

color: ${props => props.$status === 'in-progress' ? '#3b47cc' : '#ef0000'};    opacity: 1;
    pointer-events: none;
    filter: drop-shadow(2px 4px 3px rgba(0, 0, 0, 0.6));
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateX(-50%) rotate(${props => props.$rotation || 0}deg);
    transition: transform 0.4s ease;
 

    &::before {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 5px;
      height: 3px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 50%; 
      filter: blur(1px); 
      z-index: -1;
    }

   &::after {
      content: '';
      position: absolute;
      /* האלמנט פורס את כל שטח ראש הסיכה */
      top: 0; left: 0; right: 0; bottom: 0;
      
      background-image: 
        /* ברק עליון ממוקד */
        radial-gradient(circle at center, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 70%),
        /* ברק תחתון ממוקד */
        radial-gradient(circle at center, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 70%);
      
      background-repeat: no-repeat;
      
      /*הגדרת גודל לכל ברק בנפרד (רוחב גובה) */
      background-size: 8px 8px, 15px 15px;
      
      /* מיקום מדויק לכל ברק (ציר X ציר Y) */
      background-position: 35% 15%, 20% 85%;
      
      border-radius: 50%; 
      filter: blur(1px); 
    }
`;
export const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.2rem;
    padding-top: 0.3rem;
    font-size: 0.7rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
`;
export const FooterInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
`;
export const CustomSelectionCircle = styled.button`
  background: ${props => props.$isSelected ? PRIMARY_COLOR : 'rgba(255, 255, 255, 0.4)'};
  border: 2px solid ${props => props.$isSelected ? PRIMARY_COLOR : '#cbd5e1'};
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 8px;
  position: relative;
  ${touchTarget(8)}

  &::after {
    content: '✓';
    color: white;
    font-size: 11px;
    display: ${props => props.$isSelected ? 'block' : 'none'};
  }
`;
export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
export const DeadlineRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  position: relative;

  &:has(input:focus) {
    outline: 2px solid ${PRIMARY_COLOR};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;
export const DateText = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;

  @media (pointer: coarse) {
    top: -9px;
    bottom: -9px;
    height: calc(100% + 18px);
  }

  &::-webkit-calendar-picker-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;
export const DisplayDate = styled.span`
  font-size: 0.75rem;
  font-weight: bold;
  font-family: 'Assistant', sans-serif;
  color: ${props => props.$isOverdue ? DANGER_COLOR : '#64748b'};
  text-decoration: ${props => props.$isOverdue ? 'underline' : 'none'};
  white-space: nowrap; 
  z-index: 1; 
  pointer-events: none; 
`;
export const OverdueBadge = styled.span`
  font-size: 10px;
  background-color: #fee2e2;
  color: ${DANGER_COLOR};
  padding: 0px 4px;
  border-radius: 4px;
  font-weight: 800;
  border: 1px solid #fca5a5;
`;
export const ActionButtons = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
`;
export const CheckButton = styled.button`
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    ${touchTarget(6)}
    border: 2px ${props => props.$status === 'in-progress' ? 'dashed' : 'solid'}
           ${props => props.$isCompleted ? SUCCESS_COLOR :
             props.$status === 'in-progress' ? '#3b47cc' : 'rgba(0, 0, 0, 0.1)'};
               
    background: ${props => props.$isCompleted ? SUCCESS_COLOR : 'transparent'};
    color: ${props => props.$isCompleted ? 'white' :
           props.$status === 'in-progress' ? '#3b47cc' : '#94a3b8'};

    &:hover {
      transform: scale(1.1);
  background: ${props => 
    props.$isCompleted ? '#059669' :
    props.$status === 'in-progress' ? 'rgba(59, 71, 204, 0.1)' : 
    'rgba(16, 185, 129, 0.1)'
  };
  border-color: #10b981;
    }
`;
export const CreationDate = styled.span`
  font-size: 0.6rem;
  color: #94a3b8;
  font-family: 'Varela Round', sans-serif;
`;