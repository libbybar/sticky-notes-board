import './App.css';
import TodoApp from './TodoApp';
import GlobalStyle from './style/GlobalStyle';


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
