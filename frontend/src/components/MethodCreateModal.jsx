import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Tab, Nav } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const MethodCreateModal = ({ show, onHide, onMethodCreate }) => {
  const { t } = useTranslation();
  const [name, setName] = useState({ en: '', fi: '', zh: '' });
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState('en');

  const handleNameChange = (e) => {
    setName({ ...name, [activeLang]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.en) {
        setError(t('english_name_required'));
        return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/methods`, { name });
      onMethodCreate(res.data);
      onHide();
      setName({ en: '', fi: '', zh: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || t('create_method_failed');
      setError(errorMsg);
      console.error(err);
    }
  };

  const handleHide = () => {
    setError('');
    setName({ en: '', fi: '', zh: '' });
    setActiveLang('en');
    onHide();
  }

  return (
    <Modal show={show} onHide={handleHide} centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{t('create_method')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="createFormName">
            <Form.Label>{t('name')}</Form.Label>
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
                 <Form.Control type="text" name="name" value={name[activeLang]} onChange={handleNameChange} required={activeLang === 'en'} />
              </Tab.Pane>
            </Tab.Content>
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

export default MethodCreateModal;
