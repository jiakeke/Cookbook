import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Nav, Tab } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const SpecialGroupEditModal = ({ show, onHide, specialGroup, onSpecialGroupUpdate }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: { en: '', fi: '', zh: '' }, description: { en: '', fi: '', zh: '' } });
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    if (specialGroup) {
      setFormData({
        name: specialGroup.name || { en: '', fi: '', zh: '' },
        description: specialGroup.description || { en: '', fi: '', zh: '' },
      });
      setError('');
      setActiveLang('en');
    }
  }, [specialGroup]);

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
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/specialgroups/${specialGroup._id}`, formData);
      onSpecialGroupUpdate(res.data);
      onHide();
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || t('update_special_group_failed');
      setError(errorMsg);
      console.error(err);
    }
  };

  const handleHide = () => {
    setError('');
    setActiveLang('en');
    onHide();
  }

  return (
    <Modal show={show} onHide={handleHide} centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{t('edit_special_group')}</Modal.Title>
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
          <Button variant="primary" type="submit">{t('save_changes')}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SpecialGroupEditModal;
