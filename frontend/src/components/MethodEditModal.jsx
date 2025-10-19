import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Nav, Tab } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const MethodEditModal = ({ show, onHide, method, onMethodUpdate }) => {
  const { t } = useTranslation();
  const [name, setName] = useState({ en: '', fi: '', zh: '' });
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    if (method) {
      setName(method.name || { en: '', fi: '', zh: '' });
      setError('');
      setActiveLang('en');
    }
  }, [method]);

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
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/methods/${method._id}`, { name });
      onMethodUpdate(res.data);
      onHide();
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || t('update_method_failed');
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
          <Modal.Title>{t('edit_method')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="editFormName">
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
          <Button variant="primary" type="submit">{t('save_changes')}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MethodEditModal;
