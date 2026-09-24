import { createGlobalStyle } from 'styled-components';
import { PRIMARY_COLOR } from './style-constants';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {

    font-family: 'Varela Round', 'Assistant', sans-serif;
    direction: rtl;
    background: radial-gradient(circle at top right, #fdf2ff, #f0f4ff, #fff5f5);
    min-height: 100vh;
    color: #1e293b;
    line-height: 1.5;
  }

  input, button, select, textarea {
    font-family: 'Varela Round', 'Assistant', sans-serif;
  }

  button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 2px solid ${PRIMARY_COLOR};
    outline-offset: 2px;
  }

  [role="dialog"] button:focus {
    outline: 2px solid ${PRIMARY_COLOR};
    outline-offset: 2px;
  }

  [contenteditable]:focus-visible {
    outline: 2px solid ${PRIMARY_COLOR};
    outline-offset: -2px;
  }
`;

export default GlobalStyle;