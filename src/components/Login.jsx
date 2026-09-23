import React, { useState } from 'react';
import * as S from './Login.styles';
import { UserCircle2, ArrowLeftCircle } from 'lucide-react';
import { LOGIN_TITLE, LOGIN_SUBTITLE, LOGIN_NAME_PLACEHOLDER, LOGIN_SUBMIT_BUTTON } from '../strings';


const Login = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      onLogin(name.trim());
    }
  };

  return (
 <S.LoginOverlay>
      <S.LoginCard>
        <S.IconWrapper>
          <UserCircle2 size={64} strokeWidth={1.5} />
        </S.IconWrapper>
        
        <S.Title>{LOGIN_TITLE}</S.Title>
        <S.Subtitle>{LOGIN_SUBTITLE}</S.Subtitle>

        <S.StyledForm onSubmit={handleSubmit}>
          <S.Input
            type="text"
            placeholder={LOGIN_NAME_PLACEHOLDER}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <S.SubmitButton type="submit">
            {LOGIN_SUBMIT_BUTTON}
            <ArrowLeftCircle size={20} />
          </S.SubmitButton>
        </S.StyledForm>
      </S.LoginCard>
    </S.LoginOverlay>
  );
};

export default Login;