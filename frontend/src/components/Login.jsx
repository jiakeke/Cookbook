import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = {
        email,
        password,
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const body = JSON.stringify(user);

      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, body, config);
      
      // Use the login function from context to save the token
      login(res.data.token);
      
      navigate('/'); // Redirect to home page

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
      console.error(err);
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Card style={{ maxWidth: '420px', margin: '0 auto' }}>
            <Card.Body>
              <h3 className="text-center mb-4">{t('login')}</h3>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>{t('email_address')}</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>{t('password')}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit">
                    {t('login')}
                  </Button>
                </div>
              </Form>
              <div className="text-center mt-3">
                <Link to="/register">{t('dont_have_account')}</Link>
              </div>

              <div className="text-center my-3">{t('or_connect_with')}</div>

              <div className="d-grid gap-2">
                <Button variant="danger">
                  {t('login_with_google')}
                </Button>
                <Button variant="info">
                  {t('login_with_facebook')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
