import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const UserEditModal = ({ show, onHide, user, onUserUpdate }) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', role: '', allergens: [], specialGroups: [] });
  const [error, setError] = useState('');
  const [allAllergens, setAllAllergens] = useState([]);
  const [allSpecialGroups, setAllSpecialGroups] = useState([]);

  // Fetch all allergens and special groups on component mount
  useEffect(() => {
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
  }, [t]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        allergens: user.allergens?.map(a => typeof a === 'object' ? a._id : a) || [],
        specialGroups: user.specialGroups?.map(sg => typeof sg === 'object' ? sg._id : sg) || [],
      });
      setError(''); // Clear errors when a new user is loaded
    }
  }, [user]);

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

          <Form.Group className="mb-3" controlId="editFormAllergens">
            <Form.Label>{t('allergens')}</Form.Label>
            <div>
              {allAllergens.map(allergen => (
                <Form.Check
                  type="checkbox"
                  id={`edit-allergen-${allergen._id}`}
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

          <Form.Group className="mb-3" controlId="editFormSpecialGroups">
            <Form.Label>{t('special_groups')}</Form.Label>
            <div>
              {allSpecialGroups.map(group => (
                <Form.Check
                  type="checkbox"
                  id={`edit-group-${group._id}`}
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
          <Button variant="primary" type="submit">{t('save_changes')}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserEditModal;