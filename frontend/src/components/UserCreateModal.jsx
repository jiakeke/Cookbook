import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const UserCreateModal = ({ show, onHide, onUserCreate }) => {
  const { t, i18n } = useTranslation();
  const initialFormData = { name: '', email: '', password: '', role: 'user', allergens: [], specialGroups: [] };
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [allAllergens, setAllAllergens] = useState([]);
  const [allSpecialGroups, setAllSpecialGroups] = useState([]);

  useEffect(() => {
    if (show) {
      const fetchData = async () => {
        try {
          const [allergensRes, specialGroupsRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/allergens`),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/special-groups`)
          ]);
          setAllAllergens(allergensRes.data);
          setAllSpecialGroups(specialGroupsRes.data);
        } catch (err) {
          console.error("Failed to fetch data", err);
          setError(t('failed_to_load_options'));
        }
      };
      fetchData();
    }
  }, [show, t]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e, type) => {
    const { value, checked } = e.target;
    setFormData(prevState => {
      const currentSelection = prevState[type];
      if (checked) {
        return { ...prevState, [type]: [...currentSelection, value] };
      } else {
        return { ...prevState, [type]: currentSelection.filter(item => item !== value) };
      }
    });
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
      onUserCreate(res.data);
      onHide();
      setFormData(initialFormData); // Reset form for next time
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

          <Form.Group className="mb-3" controlId="createFormAllergens">
            <Form.Label>{t('allergens')}</Form.Label>
            <div>
              {allAllergens.map(allergen => (
                <Form.Check
                  type="checkbox"
                  id={`create-allergen-${allergen._id}`}
                  key={allergen._id}
                  label={allergen.name[i18n.language] || allergen.name.en}
                  value={allergen._id}
                  checked={formData.allergens.includes(allergen._id)}
                  onChange={(e) => handleCheckboxChange(e, 'allergens')}
                  inline
                />
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="createFormSpecialGroups">
            <Form.Label>{t('special_groups')}</Form.Label>
            <div>
              {allSpecialGroups.map(group => (
                <Form.Check
                  type="checkbox"
                  id={`create-group-${group._id}`}
                  key={group._id}
                  label={group.name[i18n.language] || group.name.en}
                  value={group._id}
                  checked={formData.specialGroups.includes(group._id)}
                  onChange={(e) => handleCheckboxChange(e, 'specialGroups')}
                  inline
                />
              ))}
            </div>
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
