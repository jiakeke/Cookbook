import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Tab, Nav } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const StoreCreateModal = ({ show, onHide, onStoreCreate }) => {
  const { t } = useTranslation();
  const [name, setName] = useState({ en: '', fi: '', zh: '' });
  const [logo, setLogo] = useState('');
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState('en');

  const handleNameChange = (e) => {
    setName({ ...name, [activeLang]: e.target.value });
  };

  const handleLogoChange = (e) => {
    setLogo(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.en) {
        setError(t('english_name_required'));
        return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stores`, { name, logo });
      onStoreCreate(res.data);
      onHide();
      setName({ en: '', fi: '', zh: '' });
      setLogo('');
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || t('create_store_failed');
      setError(errorMsg);
      console.error(err);
    }
  };

  const handleHide = () => {
    setError('');
    setName({ en: '', fi: '', zh: '' });
    setLogo('');
    setActiveLang('en');
    onHide();
  }

  return (
    <Modal show={show} onHide={handleHide} centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{t('create_store')}</Modal.Title>
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
              <Form.Group className="mb-3" controlId="createFormName">
                <Form.Label>{t('name')}</Form.Label>
                <Form.Control type="text" name="name" value={name[activeLang]} onChange={handleNameChange} required={activeLang === 'en'} />
              </Form.Group>
            </Tab.Pane>
          </Tab.Content>
          <Form.Group className="mb-3" controlId="createFormLogo">
            <Form.Label>{t('logo_url')}</Form.Label>
            <Form.Control type="text" name="logo" value={logo} onChange={handleLogoChange} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleHide}>{t('cancel')}</Button>
          <Button variant="primary" type="submit">{t('create')}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default StoreCreateModal;
