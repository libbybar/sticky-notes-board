import styled from 'styled-components';
import { BaseInput, BaseButton } from './SharedStyles';
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
  
  background-color: ${props => props.$color};
  border: ${props => props.$isSelected ? `2px solid ${PRIMARY_COLOR}` : `1px solid ${props.$borderColor}`};
  transform: ${props => props.$isSelected ? 'scale(1.05)' : 'scale(1)'};
  opacity: ${props => props.$isDimmed ? 0.6 : 1};

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
`;
export const IconContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;

  &:has(input:focus-visible) {
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
  &:hover { color: ${DANGER_COLOR}; }
`;
export const AddForm = styled.form`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;
export const TinyInput = styled(BaseInput)`
  flex: 1;
`;
export const ColorInput = styled.input`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: none;
  padding: 0;
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