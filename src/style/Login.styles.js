import styled from 'styled-components';
import { BaseButton, BaseInput } from './SharedStyles'; 
import { APP_BACKGROUND, PRIMARY_COLOR, TEXT_MAIN, TEXT_MUTED } from './style-constants';

export const LoginOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${APP_BACKGROUND};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  direction: rtl;
`;

export const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 400px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.5);
`;

export const IconWrapper = styled.div`
  color: ${PRIMARY_COLOR};
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
`;

export const Title = styled.h2`
  font-family: 'Varela Round', sans-serif;
  font-size: 2rem;
  color: ${TEXT_MAIN};
  margin-bottom: 0.5rem;
`;

export const Subtitle = styled.p`
  font-family: 'Amatic SC', cursive;
  font-size: 1.5rem;
  color: ${TEXT_MUTED};
  margin-bottom: 2rem;
`;

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Input = styled(BaseInput)`
  width: 100%;
  margin-bottom: 0.5rem;
`;

export const SubmitButton = styled(BaseButton)`
  background: ${PRIMARY_COLOR};
  color: white;
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;

  &:hover {
    background: #4338ca;
    transform: translateY(-2px);
  }
`;