import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Tab, Nav } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AllergenCreateModal = ({ show, onHide, onAllergenCreate }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: { en: '', fi: '', zh: '' }, description: { en: '', fi: '', zh: '' } });
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState('en');

  const handleChange = (e, field) => {
    setFormData({ ...formData, [field]: { ...formData[field], [activeLang]: e.target.value } });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.en) {
        setError(t('english_name_required'));
        return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/allergens`, formData);
      onAllergenCreate(res.data);
      handleHide();
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || t('create_allergen_failed');
      setError(errorMsg);
      console.error(err);
    }
  };

  const handleHide = () => {
    setError('');
    setFormData({ name: { en: '', fi: '', zh: '' }, description: { en: '', fi: '', zh: '' } });
    setActiveLang('en');
    onHide();
  }

  return (
    <Modal show={show} onHide={handleHide} centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{t('create_allergen')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Nav variant="tabs" activeKey={activeLang} onSelect={(k) => setActiveLang(k)} className="mb-2">
            <Nav.Item><Nav.Link eventKey="en">{t('language_en')}</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="fi">{t('language_fi')}</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="zh">{t('language_zh')}</Nav.Link></Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey={activeLang} active>
              <Form.Group className="mb-3">
                <Form.Label>{t('name')}</Form.Label>
                <Form.Control type="text" value={formData.name[activeLang]} onChange={(e) => handleChange(e, 'name')} required={activeLang === 'en'} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>{t('description')}</Form.Label>
                <Form.Control as="textarea" rows={3} value={formData.description[activeLang]} onChange={(e) => handleChange(e, 'description')} />
              </Form.Group>
            </Tab.Pane>
          </Tab.Content>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleHide}>{t('cancel')}</Button>
          <Button variant="primary" type="submit">{t('create')}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AllergenCreateModal;
