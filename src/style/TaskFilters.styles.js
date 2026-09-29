import styled from 'styled-components';

export const ControlBar = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  align-items: center;
  flex-wrap: wrap;
`;
export const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(0,0,0,0.1);
  outline: none;
  flex: 1;
  min-width: 200px;
  font-family: 'Assistant', sans-serif;

  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;
export const FilterButton = styled.button`
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  border: 1px solid ${props => props.$active ? '#3b82f6' : 'rgba(0,0,0,0.1)'};
  background: ${props => props.$active ? '#3b82f6' : 'white'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  transition: all 0.2s;

  @media (pointer: coarse) {
    min-height: 40px;
  }
`;
