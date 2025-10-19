import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner, Container } from 'react-bootstrap';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  // Redirect to login if not logged in, or to home if not an admin
  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.role === 'admin' ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
