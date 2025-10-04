import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import i18n configuration
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <React.Suspense fallback="loading...">
      <App />
    </React.Suspense>
  </React.StrictMode>,
);