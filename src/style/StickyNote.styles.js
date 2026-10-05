import styled, { css, keyframes } from 'styled-components';
import {
  DEFAULT_COLOR, PRIMARY_COLOR, DANGER_COLOR, TEXT_MAIN,
  TEXT_MUTED, SUCCESS_COLOR
} from './style-constants';
import { STICKY_NOTE_TITLE_PLACEHOLDER } from '../ui-texts';
import { touchTarget, hoverFocusTooltip } from './SharedStyles';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pinDrop = (rotation) => keyframes`
  0% { transform: translateX(-50%) translateY(-14px) rotate(${rotation}deg) scale(0.5); opacity: 0; }
  55% { transform: translateX(-50%) translateY(2px) rotate(${rotation}deg) scale(1.12); opacity: 1; }
  75% { transform: translateX(-50%) translateY(-1px) rotate(${rotation}deg) scale(0.97); }
  100% { transform: translateX(-50%) translateY(0) rotate(${rotation}deg) scale(1); }
`;

const FOLD_SIZE = 28;
const NOTE_TOP_BORDER = 8;

// The polygon reaches past the note on every side so the shadow and the pin are kept;
// only the top-right corner triangle is cut away.
const foldedCornerCut = `polygon(
  -100px -100px,
  calc(100% - ${FOLD_SIZE}px) -100px,
  calc(100% - ${FOLD_SIZE}px) 0,
  100% ${FOLD_SIZE}px,
  calc(100% + 100px) ${FOLD_SIZE}px,
  calc(100% + 100px) calc(100% + 100px),
  -100px calc(100% + 100px)
)`;

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
    clip-path: ${props => props.$isImportant ? foldedCornerCut : 'none'};
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
export const TopRowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;
export const ChecklistToggleButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    padding: 4px;
    transition: color 0.2s;
    position: relative;
    ${touchTarget(9)}
    ${hoverFocusTooltip()}
    &:hover { color: ${PRIMARY_COLOR}; }
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
    ${hoverFocusTooltip()}
    &:hover { color: ${DANGER_COLOR}; }
`;
export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
`;
export const ImportantCorner = styled.button`
  position: absolute;
  top: -${NOTE_TOP_BORDER}px;
  right: 0;
  width: ${FOLD_SIZE}px;
  height: ${FOLD_SIZE}px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  z-index: 3;
  filter: ${props => props.$isImportant ? 'drop-shadow(-1px 2px 2px rgba(0, 0, 0, 0.3))' : 'none'};
  ${touchTarget(8)}
  ${hoverFocusTooltip('end')}

  &:focus-visible {
    outline-offset: -2px;
  }

  ${props => !props.$isImportant && css`
    &:hover > span,
    &:focus-visible > span {
      background: rgba(0, 0, 0, 0.18);
    }
  `}
`;
export const CornerShape = styled.span`
  position: absolute;
  inset: 0;
  display: block;
  transition: clip-path 0.25s ease, background 0.25s ease;
  clip-path: ${props => props.$isImportant
    ? 'polygon(0 0, 100% 100%, 0 100%)'
    : 'polygon(0 0, 100% 0, 100% 100%)'};
  background: ${props => props.$isImportant
    ? `linear-gradient(to bottom left, rgba(255, 255, 255, 0.65), rgba(0, 0, 0, 0.12)), ${props.$bgColor}`
    : 'rgba(0, 0, 0, 0.07)'};
`;
export const TitleInput = styled.div`
  font-weight: bold;
  font-size: 1rem;
  font-family: 'Playpen Sans Hebrew', 'Varela Round', sans-serif;
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
    font-family: 'Playpen Sans Hebrew', 'Assistant', sans-serif;
    font-weight: 300;
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
export const ChecklistList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;
export const ChecklistItemRow = styled.li`
  display: flex;
  flex-direction: column;
`;
export const ChecklistItemMain = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
`;
// Sits in normal page flow right under a field while it's focused (not anchored to
// the current selection) - on touch devices, the OS's own selection menu (Copy/...)
// draws in roughly the same spot a selection-anchored toolbar would, hiding it; an
// always-visible bar sidesteps that. Shown on desktop too, for one consistent look.
export const FormatBar = styled.div`
  display: flex;
  gap: 2px;
  background: #334155;
  border-radius: 8px;
  padding: 4px;
  width: fit-content;
  margin: 2px 0 4px;
`;
export const FormatBarButton = styled.button`
  background: none;
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 5px;
  cursor: pointer;
  font-family: Georgia, serif;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${touchTarget(6)}

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;
export const ChecklistCheckboxWrapper = styled.label`
  display: inline-flex;
  align-items: flex-start;
  flex-shrink: 0;
  margin-top: 3px;
  position: relative;
  cursor: pointer;
  ${touchTarget(9)}
`;
export const ChecklistCheckbox = styled.input`
  cursor: pointer;
  position: relative;
  z-index: 1;
`;
export const ChecklistItemText = styled.div`
    flex: 1;
    min-width: 0;
    font-family: 'Playpen Sans Hebrew', 'Assistant', sans-serif;
    font-weight: 300;
    font-size: 1rem;
    line-height: 1.4;
    color: ${TEXT_MAIN};
    word-wrap: break-word;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    outline: none;
    text-align: start;
    direction: rtl;
    unicode-bidi: plaintext;
    text-decoration: ${props => props.$isChecked ? 'line-through' : 'none'};
    opacity: ${props => props.$isChecked ? 0.5 : 1};
    transition: all 0.2s ease;

    &:focus {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
`;
export const PinWrapper = styled.div`
    position: absolute;
    top: -25px;
    z-index: 20;
    left: 50%;

    opacity: 1;
    pointer-events: none;
    filter:
      drop-shadow(1px 1.5px 1px rgba(0, 0, 0, 0.55))
      drop-shadow(3px 5px 4px rgba(0, 0, 0, 0.35));
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${props => pinDrop(props.$rotation || 0)} 0.55s cubic-bezier(0.3, 1.4, 0.5, 1) 0.15s both;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
      transform: translateX(-50%) rotate(${props => props.$rotation || 0}deg);
    }


    &::before {
      content: '';
      position: absolute;
      top: 28px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 4px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 50%;
      filter: blur(1px);
      z-index: -1;
    }

   &::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      
      background-image: 
        radial-gradient(circle at center, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 70%),
        radial-gradient(circle at center, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 70%);
      
      background-repeat: no-repeat;
      
      background-size: 8px 8px, 15px 15px;
      
      background-position: 35% 15%, 20% 75%;
      
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
    ${hoverFocusTooltip()}
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