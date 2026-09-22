import './App.css';
import TodoApp from './TodoApp';
import GlobalStyle from './GlobalStyle';


function App() {
  return (
    <>  
    <GlobalStyle />

    <div className="App">
      <TodoApp />
    </div>
    </>
  );
}

export default App;
