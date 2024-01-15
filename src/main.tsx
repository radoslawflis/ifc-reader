import ReactDOM from 'react-dom/client';
import Viewer from './components/Viewer.tsx';
import { ModelsProvider } from './context/ModelsContext.jsx';

ReactDOM.createRoot(document.getElementById('app')!).render(
  <>
    <ModelsProvider>
      <Viewer />
    </ModelsProvider>
  </>
);
