import SqlInterface from './components/SqlInterface';
import './App.css';

function App() {
  console.log('App component rendered');

  return (
    <div className="App">
      <h1>Phil's Project - SQL Interface</h1>
      <SqlInterface />
    </div>
  );
}

export default App;
