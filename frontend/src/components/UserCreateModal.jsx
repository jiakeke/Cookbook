import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const UserCreateModal = ({ show, onHide, onUserCreate }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.password || formData.password.length < 8) {
        setError(t('password_too_short'));
        return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, formData);
      onUserCreate(res.data); // Pass created user back
      onHide(); // Close modal on success
      // Reset form for next time
      setFormData({ name: '', email: '', password: '', role: 'user' });
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || t('create_user_failed');
      setError(errorMsg);
      console.error(err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{t('create_user')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="createFormName">
            <Form.Label>{t('name')}</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={onChange} required />
          </Form.Group>
          <Form.Group className="mb-3" controlId="createFormEmail">
            <Form.Label>{t('email_address')}</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={onChange} required />
          </Form.Group>
          <Form.Group className="mb-3" controlId="createFormPassword">
            <Form.Label>{t('password')}</Form.Label>
            <Form.Control type="password" name="password" value={formData.password} onChange={onChange} required />
          </Form.Group>
          <Form.Group className="mb-3" controlId="createFormRole">
            <Form.Label>{t('role')}</Form.Label>
            <Form.Control as="select" name="role" value={formData.role} onChange={onChange}>
              <option value="user">{t('role_user')}</option>
              <option value="admin">{t('role_admin')}</option>
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>{t('cancel')}</Button>
          <Button variant="primary" type="submit">{t('create')}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserCreateModal;
