import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './components/AdminDashboard';
import AdminWelcome from './components/AdminWelcome';
import UserManagement from './components/UserManagement';
import MethodManagement from './components/MethodManagement';
import CountryOrRegionManagement from './components/CountryOrRegionManagement';
import StoreManagement from './components/StoreManagement';
import IngredientManagement from './components/IngredientManagement';
import RecipeManagement from './components/RecipeManagement';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext.jsx';

function Home() {
  const { t } = useTranslation();
  return (
    <Container className='mt-5 text-center'>
      <h1>{t('welcome_message')}</h1>
    </Container>
  );
}

function App() {
  return (
    <AuthProvider>
      <Header />
      <main className="py-3">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          
          {/* Protected Routes for any logged-in user */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Protected Routes for admin users */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<AdminWelcome />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="methods" element={<MethodManagement />} />
              <Route path="countries" element={<CountryOrRegionManagement />} />
              <Route path="stores" element={<StoreManagement />} />
              <Route path="ingredients" element={<IngredientManagement />} />
              <Route path="recipes" element={<RecipeManagement />} />
            </Route>
          </Route>
        </Routes>
      </main>
    </AuthProvider>
  );
}

export default App;
