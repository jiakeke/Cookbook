import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Nav, Tab } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const StoreEditModal = ({ show, onHide, store, onStoreUpdate }) => {
  const { t } = useTranslation();
  const [name, setName] = useState({ en: '', fi: '', zh: '' });
  const [logo, setLogo] = useState('');
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    if (store) {
      setName(store.name || { en: '', fi: '', zh: '' });
      setLogo(store.logo || '');
      setError('');
      setActiveLang('en');
    }
  }, [store]);

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
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stores/${store._id}`, { name, logo });
      onStoreUpdate(res.data);
      onHide();
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || t('update_store_failed');
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
          <Modal.Title>{t('edit_store')}</Modal.Title>
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
            </Tab.Pane>
          </Tab.Content>
          <Form.Group className="mb-3" controlId="editFormLogo">
            <Form.Label>{t('logo_url')}</Form.Label>
            <Form.Control type="text" name="logo" value={logo} onChange={handleLogoChange} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleHide}>{t('cancel')}</Button>
          <Button variant="primary" type="submit">{t('save_changes')}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default StoreEditModal;
