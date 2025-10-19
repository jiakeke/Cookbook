import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Nav, Tab } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const CountryOrRegionEditModal = ({ show, onHide, country, onCountryUpdate }) => {
  const { t } = useTranslation();
  const [name, setName] = useState({ en: '', fi: '', zh: '' });
  const [description, setDescription] = useState({ en: '', fi: '', zh: '' });
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    if (country) {
      setName(country.name || { en: '', fi: '', zh: '' });
      setDescription(country.description || { en: '', fi: '', zh: '' });
      setError('');
      setActiveLang('en');
    }
  }, [country]);

  const handleNameChange = (e) => {
    setName({ ...name, [activeLang]: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setDescription({ ...description, [activeLang]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.en) {
        setError(t('english_name_required'));
        return;
    }
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/countries/${country._id}`, { name, description });
      onCountryUpdate(res.data);
      onHide();
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || t('update_country_failed');
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
          <Modal.Title>{t('edit_country')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Nav variant="tabs" activeKey={activeLang} onSelect={(k) => setActiveLang(k)} className="mb-2">
            <Nav.Item>
              <Nav.Link eventKey="en">{t('language_en')}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="fi">{t('language_fi')}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="zh">{t('language_zh')}</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey={activeLang} active>
              <Form.Group className="mb-3" controlId="editFormName">
                <Form.Label>{t('name')}</Form.Label>
                <Form.Control type="text" name="name" value={name[activeLang]} onChange={handleNameChange} required={activeLang === 'en'} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="editFormDescription">
                <Form.Label>{t('description')}</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={description[activeLang]} onChange={handleDescriptionChange} />
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

export default CountryOrRegionEditModal;
