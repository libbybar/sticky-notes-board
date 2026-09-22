import React, { useState } from 'react';
import * as S from './Login.styles';
import { UserCircle2, ArrowLeftCircle } from 'lucide-react';


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
        
        <S.Title>שלום לך</S.Title>
        <S.Subtitle>מה שמך?</S.Subtitle>
        
        <S.StyledForm onSubmit={handleSubmit}>
          <S.Input 
            type="text" 
            placeholder="פה המקום להכניס שם"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <S.SubmitButton type="submit">
            להיכנס לאפליקציה
            <ArrowLeftCircle size={20} />
          </S.SubmitButton>
        </S.StyledForm>
      </S.LoginCard>
    </S.LoginOverlay>
  );
};

export default Login;