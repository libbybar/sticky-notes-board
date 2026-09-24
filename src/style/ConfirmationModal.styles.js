import styled from 'styled-components';
import { BaseButton } from './SharedStyles';
import { DANGER_COLOR, TEXT_MAIN, TEXT_MUTED } from './style-constants';

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  direction: rtl;
`;
export const ModalContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  text-align: center;
`;
export const WarningIcon = styled.div`
  color: ${DANGER_COLOR}; 
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
`;
export const Title = styled.h3`
  font-family: 'Varela Round', sans-serif; 
  font-size: 1.5rem;
  color: ${TEXT_MAIN};
  margin-bottom: 0.5rem;
`;
export const Message = styled.p`
  color: ${TEXT_MUTED};
  margin-bottom: 2rem;
  line-height: 1.5;
`;
export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;
export const CancelButton = styled(BaseButton)`
  background: #f1f5f9;
  color: #475569;
  &:hover { background: #e2e8f0; }
`;
export const ConfirmButton = styled(BaseButton)`
  background: ${DANGER_COLOR}; 
  color: white;
  &:hover { 
    filter: brightness(0.9); 
  }
`;