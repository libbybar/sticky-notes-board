import styled from 'styled-components';
import { BaseInput, BaseButton, touchTarget } from './SharedStyles';
import { PRIMARY_COLOR, DANGER_COLOR, TEXT_MUTED } from './style-constants';

export const ManagerContainer = styled.div`
  max-width: 600px;
  margin: 0 auto 2rem auto;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  direction: rtl;
`;
export const CategoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;
export const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-family: 'Varela Round', sans-serif;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 100%;
  min-width: 0;

  background-color: ${props => props.$color};
  border: ${props => props.$isSelected ? `2px solid ${PRIMARY_COLOR}` : `1px solid ${props.$borderColor}`};
  transform: ${props => props.$isSelected ? 'scale(1.05)' : 'scale(1)'};
  opacity: ${props => props.$isDimmed ? 0.6 : 1};
  /* transform (always set, just above) makes every tag its own stacking context, so a
     later sibling tag would otherwise paint over this one's open color popover
     regardless of the popover's own z-index. Raising the open tag itself above its
     siblings fixes that without touching tab order (unlike portaling the popover). */
  z-index: ${props => props.$isColorPickerOpen ? 5 : 'auto'};

  &:hover {
    transform: scale(1.05);
  }
`;
export const TagName = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-align: inherit;
  cursor: pointer;
  min-width: 0;
  overflow-wrap: anywhere;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -0.4rem -0.5rem;
  }
`;
export const ColorCircle = styled.input`
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  background: transparent;
  opacity: 0;
  position: absolute;
  z-index: 2;

  &::-webkit-color-swatch-wrapper { padding: 0; }
  &::-webkit-color-swatch { border: none; border-radius: 50%; }

  /* The native color picker is flaky on touch devices (see ColorPickerWrapper
     below for the pastel-palette replacement shown there instead). */
  @media (pointer: coarse) {
    display: none;
  }
`;
export const DesktopColorIcon = styled.span`
  display: contents;

  @media (pointer: coarse) {
    display: none;
  }
`;
export const IconContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;

  &:has(input:focus-visible),
  &:has(button:focus-visible) {
    outline: 2px solid ${PRIMARY_COLOR};
    outline-offset: 2px;
    border-radius: 50%;
  }
`;
export const DeleteIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${TEXT_MUTED};
  padding: 0;
  position: relative;
  ${touchTarget(9)}
  &:hover { color: ${DANGER_COLOR}; }
`;
export const AddForm = styled.form`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  /* The 7 palette swatches (touch only) need ~260px on their own row, which would
     otherwise squeeze this field toward 0 width (its min-width:0 makes it the most
     willing to shrink of the form's children) on a narrow phone screen. */
  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
`;
export const TinyInput = styled(BaseInput)`
  flex: 1;
  min-width: 0;

  @media (max-width: 600px) {
    font-size: 1rem;
    flex: 1 1 100%;
  }
`;
export const ColorPickerWrapper = styled.div`
  display: none;
  position: relative;
  align-items: center;
  justify-content: center;

  @media (pointer: coarse) {
    display: flex;
  }
`;
export const ColorTriggerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  ${touchTarget(8)}

  &:focus-visible {
    outline: 2px solid ${PRIMARY_COLOR};
    outline-offset: 2px;
  }
`;
export const ColorPopoverPanel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 132px;
  padding: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 5;
`;
export const ColorInput = styled.input`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: none;
  padding: 0;

  @media (pointer: coarse) {
    display: none;
  }
`;
// A plain wrapper (not ColorSwatchRow itself) carries the responsive display:none -
// an element whose own computed display is "none" has no computable accessible name
// (even accessed via getByRole's hidden:true in tests), so the toggle has to live one
// level up from the role="group" node that actually needs to keep its name.
export const MobileColorPalette = styled.div`
  display: none;

  @media (pointer: coarse) {
    display: contents;
  }
`;
export const ColorSwatchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;
export const ColorSwatchButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  border: 2px solid ${props => props.$isSelected ? PRIMARY_COLOR : 'rgba(0, 0, 0, 0.12)'};
  box-shadow: ${props => props.$isSelected ? `0 0 0 2px white, 0 0 0 4px ${PRIMARY_COLOR}` : 'none'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  position: relative;
  color: #334155;
  ${touchTarget(6)}

  &:focus-visible {
    outline: 2px solid ${PRIMARY_COLOR};
    outline-offset: 2px;
  }

  @media (pointer: coarse) {
    width: 32px;
    height: 32px;
  }
`;
export const IconButton = styled(BaseButton)`
  background: ${PRIMARY_COLOR};
  color: white;
  padding: 0.5rem;
  &:hover { 
    background: ${PRIMARY_COLOR};
    filter: brightness(0.9);
  }
`;