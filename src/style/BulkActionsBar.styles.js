import styled from 'styled-components';

export const BulkActionBanner = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  padding: 1rem 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1.2rem;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  span {
    font-weight: 600;
    color: #1e293b;
    font-family: 'Assistant', sans-serif;
  }

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }
`;
export const CategorySelect = styled.select`
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.1);
  font-family: 'Assistant', sans-serif;
  background: white;
  cursor: pointer;
  outline: none;
  color: #1e293b;

  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;
export const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  background: ${props => props.$variant === 'danger' ? '#fee2e2' : '#f1f5f9'};
  color: ${props => props.$variant === 'danger' ? '#ef4444' : '#475569'};

  &:hover {
    background: ${props => props.$variant === 'danger' ? '#ef4444' : '#e2e8f0'};
    color: ${props => props.$variant === 'danger' ? 'white' : '#1e293b'};
  }
`;
