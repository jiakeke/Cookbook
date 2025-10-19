import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Tab, Nav, Col, Row, Stack } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const IngredientEditModal = ({ show, onHide, ingredient, onIngredientUpdate }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState(null);
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stores?limit=1000`);
        setStores(res.data.stores || []);
      } catch (err) {
        console.error('Failed to fetch stores', err);
      }
    };
    if (show) {
      fetchStores();
    }
  }, [show]);

  useEffect(() => {
    if (ingredient) {
      setFormData({
        ...ingredient,
        link: (ingredient.link || []).map(l => ({ ...l, store: l.store?._id || null }))
      });
    } else {
      setFormData(null);
    }
    setError('');
    setActiveLang('en');
  }, [ingredient]);

  if (!formData) return null;

  const handleNameChange = (e) => {
    setFormData({ ...formData, name: { ...formData.name, [activeLang]: e.target.value } });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- Link Handlers ---
  const handleLinkChange = (index, e) => {
    const { name, value } = e.target;
    const newLinks = [...formData.link];
    newLinks[index][name] = value;
    setFormData({ ...formData, link: newLinks });
  };

  const addLink = () => {
    setFormData({ 
      ...formData, 
      link: [...formData.link, { uri: '', price: '', size: '', store: null }] 
    });
  };

  const removeLink = (index) => {
    const newLinks = formData.link.filter((_, i) => i !== index);
    setFormData({ ...formData, link: newLinks });
  };
  // ---------------------

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.en) {
      setError(t('english_name_required'));
      return;
    }
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/ingredients/${ingredient._id}`, formData);
      onIngredientUpdate(res.data);
      onHide();
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || t('update_ingredient_failed');
      setError(errorMsg);
      console.error(err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{t('edit_ingredient')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>{t('name')}</Form.Label>
            <Nav variant="tabs" activeKey={activeLang} onSelect={(k) => setActiveLang(k)} className="mb-2">
              <Nav.Item><Nav.Link eventKey="en">{t('language_en')}</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="fi">{t('language_fi')}</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="zh">{t('language_zh')}</Nav.Link></Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey={activeLang} active>
                <Form.Control type="text" value={formData.name[activeLang]} onChange={handleNameChange} required={activeLang === 'en'} />
              </Tab.Pane>
            </Tab.Content>
          </Form.Group>

          <Form.Group className="mb-3" controlId="editFormImage">
            <Form.Label>{t('image_url')}</Form.Label>
            <Form.Control type="text" name="image" value={formData.image} onChange={handleChange} />
          </Form.Group>

          <h5>{t('purchase_links')}</h5>
          <Stack gap={3}>
            {formData.link.map((linkItem, index) => (
              <div key={index} className="p-2 border rounded">
                <Row>
                   <Col xs={10} sm={11}>
                      <p className="fw-bold mb-1">{t('link')} #{index + 1}</p>
                   </Col>
                   <Col xs={2} sm={1} className="text-end">
                      <Button variant="danger" size="sm" onClick={() => removeLink(index)}>X</Button>
                   </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-2">
                      <Form.Label>{t('url')}</Form.Label>
                      <Form.Control type="text" name="uri" value={linkItem.uri} onChange={(e) => handleLinkChange(index, e)} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Label>{t('price')}</Form.Label>
                      <Form.Control type="number" name="price" value={linkItem.price} onChange={(e) => handleLinkChange(index, e)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Label>{t('size_spec')}</Form.Label>
                      <Form.Control type="text" name="size" value={linkItem.size} onChange={(e) => handleLinkChange(index, e)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Label>{t('store')}</Form.Label>
                      <Form.Select name="store" value={linkItem.store || ''} onChange={(e) => handleLinkChange(index, e)}>
                        <option value="">{t('select_store')}</option>
                        {stores.map(store => (
                          <option key={store._id} value={store._id}>{store.name.en}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            ))}
          </Stack>
          <Button variant="outline-primary" onClick={addLink} className="mt-2">{t('add_link')}</Button>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>{t('cancel')}</Button>
          <Button variant="primary" type="submit">{t('save_changes')}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default IngredientEditModal;
