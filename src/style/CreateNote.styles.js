import styled from 'styled-components';
import { DEFAULT_COLOR, PRIMARY_COLOR, TEXT_MAIN, TEXT_MUTED } from './style-constants';

// A straight, non-animated variant of StickyNote's NoteContainer: this is the
// creation surface itself, not a note pinned to the board, so it skips the
// rotation and entrance animation real notes get once they're added.
export const CreateNoteForm = styled.form`
  width: 100%;
  max-width: 420px;
  margin: 0 auto 2rem auto;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  position: relative;
  background-color: ${props => props.$bgColor || DEFAULT_COLOR};
  border-top: 8px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  @media (max-width: 600px) {
    max-width: 100%;
    margin: 0 0 1.5rem 0;
  }
`;

export const Heading = styled.h2`
  margin: 0;
  font-family: 'Varela Round', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  color: ${TEXT_MAIN};
`;

export const TitleField = styled.input`
  font-weight: bold;
  font-size: 1rem;
  font-family: 'Varela Round', sans-serif;
  border: none;
  outline: none;
  background: transparent;
  color: ${TEXT_MAIN};
  padding: 0.3rem 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.15);

  &::placeholder {
    color: #94a3b8;
  }
`;

export const ContentField = styled.textarea`
  font-family: 'Assistant', sans-serif;
  font-weight: 300;
  font-style: italic;
  font-size: 1.1rem;
  line-height: 1.4;
  color: ${TEXT_MAIN};
  border: none;
  outline: none;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  resize: vertical;
  min-height: 4.5rem;
  padding: 0.5rem;
  direction: rtl;

  &::placeholder {
    color: ${TEXT_MUTED};
  }

  &:focus {
    background: rgba(255, 255, 255, 0.45);
  }
`;

export const DetailsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

export const SubmitButton = styled.button`
  width: 100%;
  background: ${PRIMARY_COLOR};
  color: white;
  border: none;
  padding: 0.7rem 1rem;
  border-radius: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(0.9);
  }
`;
