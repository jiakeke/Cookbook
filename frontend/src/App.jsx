import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import { useTranslation } from 'react-i18next';

function Home() {
  const { t } = useTranslation();
  return (
    <Container className='mt-5 text-center'>
      <h1>{t('welcome_message')}</h1>
    </Container>
  );
}

import { AuthProvider } from './context/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main className="py-3">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;