import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Tab, Nav, Col, Row } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const RecipeEditModal = ({ show, onHide, recipe, onRecipeUpdate }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState(null);
  const [dependencies, setDependencies] = useState({ countries: [], ingredients: [], methods: [] });
  const [error, setError] = useState('');
  const [loadingDeps, setLoadingDeps] = useState(true);
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    const fetchDependencies = async () => {
      setLoadingDeps(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/recipes/dependencies`);
        setDependencies(res.data);
      } catch (err) {
        console.error('Failed to fetch dependencies', err);
        setError(t('fetch_dependencies_failed'));
      } finally {
        setLoadingDeps(false);
      }
    };
    if (show) {
      fetchDependencies();
    }
  }, [show, t]);

  useEffect(() => {
    if (recipe) {
      setFormData({
        ...recipe,
        country_or_region: recipe.country_or_region?._id || null,
        ingredients: recipe.ingredients.map(ing => ({
          ...ing,
          ingredient: ing.ingredient?._id || '',
          method: ing.method?._id || null,
        }))
      });
    } else {
      setFormData(null);
    }
    setError('');
    setActiveLang('en');
  }, [recipe]);

  if (!formData) return null; // Don't render modal without data

  const handleMultiLangChange = (e, field) => {
    setFormData({ ...formData, [field]: { ...formData[field], [activeLang]: e.target.value } });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleIngredientChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newIngredients = [...formData.ingredients];
    newIngredients[index][name] = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({ 
      ...formData, 
      ingredients: [...formData.ingredients, { ingredient: '', quantity: '', unit: '', optional: false, method: null }] 
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.en) {
      setError(t('english_name_required'));
      return;
    }
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/recipes/${recipe._id}`, formData);
      onRecipeUpdate(res.data);
      onHide();
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || t('update_recipe_failed');
      setError(errorMsg);
      console.error(err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{t('edit_recipe')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {loadingDeps ? <p>{t('loading_dependencies')}...</p> : (
            <>
              {/* Name and Preparation Tabs */}
              <Nav variant="tabs" activeKey={activeLang} onSelect={(k) => setActiveLang(k)} className="mb-2">
                <Nav.Item><Nav.Link eventKey="en">{t('language_en')}</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="fi">{t('language_fi')}</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="zh">{t('language_zh')}</Nav.Link></Nav.Item>
              </Nav>
              <Tab.Content>
                <Tab.Pane eventKey={activeLang} active>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('recipe_name')}</Form.Label>
                    <Form.Control type="text" value={formData.name[activeLang]} onChange={(e) => handleMultiLangChange(e, 'name')} required={activeLang === 'en'} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('recipe_description')}</Form.Label>
                    <Form.Control as="textarea" rows={3} value={formData.description ? formData.description[activeLang] : ''} onChange={(e) => handleMultiLangChange(e, 'description')} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('preparation')}</Form.Label>
                    <Form.Control as="textarea" rows={5} value={formData.preparation[activeLang]} onChange={(e) => handleMultiLangChange(e, 'preparation')} />
                  </Form.Group>
                </Tab.Pane>
              </Tab.Content>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('image_url')}</Form.Label>
                    <Form.Control type="text" name="image" value={formData.image} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('country_or_region')}</Form.Label>
                    <Form.Select name="country_or_region" value={formData.country_or_region || ''} onChange={handleChange}>
                      <option value="">{t('select_country')}</option>
                      {dependencies.countries.map(c => <option key={c._id} value={c._id}>{c.name.en}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Nutrition */}
              <h5>{t('nutrition_facts')}</h5>
              <Row>
                <Col md={3}><Form.Group><Form.Label>{t('calorie')} (kcal)</Form.Label><Form.Control type="number" name="calorie" value={formData.calorie} onChange={handleChange} /></Form.Group></Col>
                <Col md={3}><Form.Group><Form.Label>{t('protein')} (g)</Form.Label><Form.Control type="number" name="protein" value={formData.protein} onChange={handleChange} /></Form.Group></Col>
                <Col md={3}><Form.Group><Form.Label>{t('carbohydrate')} (g)</Form.Label><Form.Control type="number" name="carbohydrate" value={formData.carbohydrate} onChange={handleChange} /></Form.Group></Col>
                <Col md={3}><Form.Group><Form.Label>{t('fat')} (g)</Form.Label><Form.Control type="number" name="fat" value={formData.fat} onChange={handleChange} /></Form.Group></Col>
              </Row>

              {/* Ingredients Dynamic List */}
              <h5 className="mt-4">{t('ingredients')}</h5>
              {formData.ingredients.map((ing, index) => (
                <Row key={index} className="mb-2 align-items-center">
                  <Col md={3}>
                    <Form.Select name="ingredient" value={ing.ingredient} onChange={(e) => handleIngredientChange(index, e)} required>
                      <option value="">{t('select_ingredient')}</option>
                      {dependencies.ingredients.map(i => <option key={i._id} value={i._id}>{i.name.en}</option>)}
                    </Form.Select>
                  </Col>
                  <Col md={2}><Form.Control type="number" name="quantity" placeholder={t('quantity')} value={ing.quantity} onChange={(e) => handleIngredientChange(index, e)} required /></Col>
                  <Col md={2}><Form.Control type="text" name="unit" placeholder={t('unit')} value={ing.unit} onChange={(e) => handleIngredientChange(index, e)} required /></Col>
                  <Col md={3}>
                    <Form.Select name="method" value={ing.method || ''} onChange={(e) => handleIngredientChange(index, e)}>
                      <option value="">{t('select_method')}</option>
                      {dependencies.methods.map(m => <option key={m._id} value={m._id}>{m.name.en}</option>)}
                    </Form.Select>
                  </Col>
                  <Col md={1}><Form.Check type="checkbox" name="optional" label={t('optional_short')} checked={ing.optional} onChange={(e) => handleIngredientChange(index, e)} /></Col>
                  <Col md={1}><Button variant="danger" size="sm" onClick={() => removeIngredient(index)}>X</Button></Col>
                </Row>
              ))}
              <Button variant="outline-primary" onClick={addIngredient} className="mt-2">{t('add_ingredient')}</Button>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>{t('cancel')}</Button>
          <Button variant="primary" type="submit">{t('save_changes')}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RecipeEditModal;
