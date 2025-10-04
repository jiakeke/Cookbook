import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { t } = useTranslation();
  const { token, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    gender: '',
    height: '',
    weight: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`);
        const { name, birthday, gender, height, weight } = res.data;
        setFormData({
          name: name || '',
          birthday: birthday ? new Date(birthday).toISOString().split('T')[0] : '',
          gender: gender || '',
          height: height || '',
          weight: weight || '',
        });
      } catch (err) {
        setError(t('fetch_profile_failed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const { name, birthday, gender, height, weight } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Custom validation
    if (!formData.name.trim()) {
      setError(t('name_is_required'));
      return;
    }

    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, formData);
      updateUser(res.data);
      setSuccess(t('update_profile_success'));
    } catch (err) {
        const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || t('update_profile_failed');
        setError(errorMsg);
        console.error(err);
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Card.Body>
              <h3 className="text-center mb-4">{t('user_profile')}</h3>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form noValidate onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formName">
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

                <Form.Group className="mb-3" controlId="formBirthday">
                  <Form.Label>{t('birthday')}</Form.Label>
                  <Form.Control type="date" name="birthday" value={birthday} onChange={onChange} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGender">
                  <Form.Label>{t('gender')}</Form.Label>
                  <Form.Control as="select" name="gender" value={gender} onChange={onChange}>
                    <option value="">{t('select_gender')}</option>
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                    <option value="other">{t('other')}</option>
                  </Form.Control>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formHeight">
                      <Form.Label>{t('height_cm')}</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 175"
                        name="height"
                        value={height}
                        onChange={onChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formWeight">
                      <Form.Label>{t('weight_kg')}</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 70"
                        name="weight"
                        value={weight}
                        onChange={onChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid mt-3">
                  <Button variant="primary" type="submit">
                    {t('update_profile')}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;