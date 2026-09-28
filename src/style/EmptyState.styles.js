import styled from 'styled-components';
import { BaseButton } from './SharedStyles';
import { PRIMARY_COLOR, TEXT_MAIN, TEXT_MUTED } from './style-constants';

export const Card = styled.div`
  grid-column: 1 / -1;
  justify-self: center;
  width: 100%;
  max-width: 420px;
  padding: 2rem 1.5rem;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
`;
export const Illustration = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;
export const Title = styled.h3`
  font-family: 'Varela Round', sans-serif;
  font-size: 1.4rem;
  color: ${TEXT_MAIN};
  margin: 0 0 0.5rem;
`;
export const Message = styled.p`
  color: ${TEXT_MUTED};
  line-height: 1.5;
  margin: 0;
`;
export const ActionButton = styled(BaseButton)`
  margin: 1.2rem auto 0;
  background: ${PRIMARY_COLOR};
  color: white;
  &:hover { filter: brightness(0.92); }
`;
