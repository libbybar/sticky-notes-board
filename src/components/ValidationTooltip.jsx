import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';


const fadeInOut = keyframes`
  0% { opacity: 0; transform: translateY(5px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; }
  100% { opacity: 0; }
`;
const TooltipContainer = styled.div`
  position: absolute;
  bottom: 110%;
  right: 10px;
  background: #334155;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  z-index: 1000;
  pointer-events: none; /* שלא יפריע ללחיצות מתחתיו */
  animation: ${fadeInOut} 3s forwards;

  /* החץ הקטן למטה */
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 20px;
    border: 6px solid transparent;
    border-top-color: #334155;
  }
`;

const ValidationTooltip = ({ message, onClear }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClear();
    }, 3000);

    return () => clearTimeout(timer); 
  }, [message, onClear]);

  if (!message) return null;

  return <TooltipContainer>{message}</TooltipContainer>;
};

export default ValidationTooltip;