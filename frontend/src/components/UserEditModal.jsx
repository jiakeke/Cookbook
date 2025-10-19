import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const UserEditModal = ({ show, onHide, user, onUserUpdate }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
      });
      setError(''); // Clear errors when a new user is loaded
    }
  }, [user]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${user._id}`, formData);
      onUserUpdate(res.data); // Pass updated user back
      onHide(); // Close modal on success
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || t('update_user_failed');
      setError(errorMsg);
      console.error(err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{t('edit_user')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="editFormName">
            <Form.Label>{t('name')}</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="editFormEmail">
            <Form.Label>{t('email_address')}</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="editFormRole">
            <Form.Label>{t('role')}</Form.Label>
            <Form.Control
              as="select"
              name="role"
              value={formData.role}
              onChange={onChange}
            >
              <option value="user">{t('role_user')}</option>
              <option value="admin">{t('role_admin')}</option>
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>{t('cancel')}</Button>
          <Button variant="primary" type="submit">{t('save_changes')}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserEditModal;