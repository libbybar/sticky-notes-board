import React, { useId, useRef, useState } from 'react';
import * as S from '../style/Login.styles';
import { UserCircle2, ArrowLeftCircle } from 'lucide-react';
import {
  LOGIN_TITLE,
  LOGIN_INTRO,
  LOGIN_SUBTITLE,
  LOGIN_NAME_PLACEHOLDER,
  LOGIN_NAME_ERROR,
  LOGIN_STORAGE_NOTICE,
  LOGIN_SUBMIT_BUTTON
} from '../ui-texts';

const MIN_NAME_LENGTH = 2;

const Login = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const errorId = useId();
  const nameInputRef = useRef(null);

  const isValidName = (value) => value.trim().length >= MIN_NAME_LENGTH;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidName(name)) {
      setError(LOGIN_NAME_ERROR);
      nameInputRef.current?.focus();
      return;
    }
    onLogin(name.trim());
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (error && isValidName(value)) setError('');
    setName(value);
  };

  return (
    <S.LoginOverlay>
      <S.LoginCard>
        <S.IconWrapper>
          <UserCircle2 size={64} strokeWidth={1.5} />
        </S.IconWrapper>

        <S.Title>{LOGIN_TITLE}</S.Title>
        <S.Intro>{LOGIN_INTRO}</S.Intro>
        <S.Subtitle>{LOGIN_SUBTITLE}</S.Subtitle>

        <S.StyledForm onSubmit={handleSubmit}>
          <S.Input
            ref={nameInputRef}
            type="text"
            placeholder={LOGIN_NAME_PLACEHOLDER}
            aria-label={LOGIN_NAME_PLACEHOLDER}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            value={name}
            onChange={handleNameChange}
            autoFocus
          />
          {error && <S.ErrorText id={errorId} role="alert">{error}</S.ErrorText>}
          <S.SubmitButton type="submit">
            {LOGIN_SUBMIT_BUTTON}
            <ArrowLeftCircle size={20} />
          </S.SubmitButton>
        </S.StyledForm>

        <S.StorageNotice>{LOGIN_STORAGE_NOTICE}</S.StorageNotice>
      </S.LoginCard>
    </S.LoginOverlay>
  );
};

export default Login;
