import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { name, email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const newUser = {
        name,
        email,
        password,
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const body = JSON.stringify(newUser);

      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, body, config);
      
      setSuccess('Registration successful! Redirecting to login...');
      console.log(res.data); // This will contain the token

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const errorMsg = err.response.data.errors.map(e => e.msg).join(', ');
        setError(errorMsg);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
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
              <h3 className="text-center mb-4">{t('register')}</h3>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formBasicName">
                  <Form.Label>{t('name')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                  />
                </Form.Group>

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
                    {t('register')}
                  </Button>
                </div>
              </Form>
              <div className="text-center mt-3">
                <Link to="/login">{t('already_have_account')}</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
