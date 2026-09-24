import styled from 'styled-components';
import { PRIMARY_COLOR, TEXT_MAIN, TEXT_MUTED } from './style-constants';

export const InputContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto 3rem auto;
`;
export const StyledForm = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 0.5rem 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-bottom: 4px solid #e0e7ff;
  transition: all 0.3s ease;
  gap: 0.8rem;

  &:focus-within {
    border-bottom-color: ${PRIMARY_COLOR};
    transform: translateY(-2px);
    background: #ffffff;
  }
`;
export const TextInput = styled.input`
  flex: 1;
  min-width: 100px;
  border: none;
  background: transparent;
  padding: 0.5rem;
  font-size: 1.6rem;
  text-align: right;
  font-family: 'Amatic SC', cursive;
  outline: none;
  color: ${TEXT_MAIN};

  &::placeholder {
    color: ${TEXT_MUTED};
  }
`;
export const DateInput = styled.input`
  padding: 0.5rem;
  border-radius: 12px;
  border: 2px solid #e0e7ff;
  font-family: 'Assistant', sans-serif;
  font-size: 0.8rem;
  outline: none;
  color: #475569;
  cursor: pointer;

  &:focus {
    border-color: #e546c0;
  }
`;
export const CategorySelect = styled.select`
  padding: 0.5rem;
  border-radius: 12px;
  border: 2px solid #e0e7ff;
  font-family: 'Assistant', sans-serif;
  background: white;
  cursor: pointer;
  outline: none;
  color: ${TEXT_MAIN};

  &:focus {
    border-color: #3ae008;
  }
`;
export const AddButton = styled.button`
  background: ${PRIMARY_COLOR};
  color: white;
  border: none;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  margin-right: auto; /* שומר על המיקום המקורי */

  &:hover {
    filter: brightness(0.9);
  }
`;