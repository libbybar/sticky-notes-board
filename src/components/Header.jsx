import React from 'react';
import styled from 'styled-components';
import { HEADER_GREETING_PREFIX, HEADER_SUBTITLE } from '../ui-texts';

const HeaderContainer = styled.header`
  margin-bottom: 3rem;
  text-align: right;
  padding: 1rem;
  width: 100%;
`;
const MainGreeting = styled.h1`
  font-family: 'Assistant', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;

  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;
const NameHighlight = styled.span`
  color: #4f46e5;
  text-decoration: underline;
  text-decoration-style: wavy; 
  text-decoration-color: #a5b4fc;
`;
const SubTitle = styled.p`
  color: #64748b;
  font-size: 2rem;
  margin-top: 0.5rem;
  font-family: 'Amatic SC', cursive;
`;
const Header = ({ userName }) => (
  <HeaderContainer>
    <MainGreeting>
      {HEADER_GREETING_PREFIX}<NameHighlight>{userName}</NameHighlight>
    </MainGreeting>
    <SubTitle>
      {HEADER_SUBTITLE}
    </SubTitle>
  </HeaderContainer>
);

export default Header;