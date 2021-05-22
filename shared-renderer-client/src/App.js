import logo from './logo.svg';
import './App.css';
import SharedRendererViewer from './components/sharedRenderViewer';
import SharedRendererRenderer from './components/sharedRenderer';

function App() {
  return (
    <div className="App">
      <SharedRendererViewer width={window.innerWidth/2} height={window.innerHeight/2}></SharedRendererViewer>
      <SharedRendererRenderer width={window.innerWidth/2} height={window.innerHeight/2}></SharedRendererRenderer>
      <SharedRendererViewer width={window.innerWidth/2} height={window.innerHeight/2}></SharedRendererViewer>
    </div>
  );
}

export default App;
