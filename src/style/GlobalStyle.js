import { createGlobalStyle } from 'styled-components';

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
`;

export default GlobalStyle;