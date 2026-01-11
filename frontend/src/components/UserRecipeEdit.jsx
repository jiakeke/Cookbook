import React, { useState, useEffect, useCallback } from 'react';
import { Container, Button, Form, Alert, Tab, Nav, Col, Row, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../utils/translationHelper';
import { useAuth } from '../context/AuthContext';

const UserRecipeEdit = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState(null);
  const [dependencies, setDependencies] = useState({ countries: [], ingredients: [], methods: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeLang, setActiveLang] = useState('en');

  const fetchRecipeAndDeps = useCallback(async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [recipeRes, depsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/recipes/${id}`, config),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/recipes/dependencies`, config)
      ]);

      const recipeData = recipeRes.data;
      setDependencies(depsRes.data);

      setFormData({
        ...recipeData,
        country_or_region: recipeData.country_or_region?._id || null,
        ingredients: recipeData.ingredients.map(ing => ({
          ...ing,
          ingredient: ing.ingredient?._id || '',
          method: ing.method?._id || null,
        }))
      });

    } catch (err) {
      console.error('Failed to fetch data', err);
      setError(t('fetch_recipe_failed'));
    } finally {
      setLoading(false);
    }
  }, [id, t, token]);

  useEffect(() => {
    fetchRecipeAndDeps();
  }, [fetchRecipeAndDeps]);

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }
  
  if (error) {
    return <Container><Alert variant="danger" className="mt-4">{error}</Alert></Container>;
  }

  if (!formData) return null;

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
    setSuccess('');
    if (!formData.name.en) {
      setError(t('english_name_required'));
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = { ...formData };
      delete payload.isOriginal;
      delete payload.originalRecipe;
      delete payload._id;
      delete payload.creator;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.comments;

      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/my-recipes/${id}`, payload, config);
      setSuccess(t('recipe_updated_success'));
      setTimeout(() => navigate('/my-recipes'), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || t('update_recipe_failed');
      setError(errorMsg);
      console.error(err);
    }
  };

  return (
    <Container className="my-4">
      <h1>{t('edit_recipe')}</h1>
      <p className="text-muted">{getLocalizedValue(formData.name, i18n.language)}</p>
      <hr />
      <Form onSubmit={onSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Nav variant="tabs" activeKey={activeLang} onSelect={(k) => setActiveLang(k)} className="mb-2">
          <Nav.Item><Nav.Link eventKey="en">{t('language_en')}</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="fi">{t('language_fi')}</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="zh">{t('language_zh')}</Nav.Link></Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey={activeLang} active>
            <Form.Group className="mb-3"><Form.Label>{t('recipe_name')}</Form.Label><Form.Control type="text" value={formData.name[activeLang]} onChange={(e) => handleMultiLangChange(e, 'name')} required={activeLang === 'en'} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>{t('recipe_description')}</Form.Label><Form.Control as="textarea" rows={3} value={formData.description ? formData.description[activeLang] : ''} onChange={(e) => handleMultiLangChange(e, 'description')} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>{t('preparation')}</Form.Label><Form.Control as="textarea" rows={5} value={formData.preparation[activeLang]} onChange={(e) => handleMultiLangChange(e, 'preparation')} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>{t('remark')}</Form.Label><Form.Control as="textarea" rows={3} value={formData.remark ? formData.remark[activeLang] : ''} onChange={(e) => handleMultiLangChange(e, 'remark')} /></Form.Group>
          </Tab.Pane>
        </Tab.Content>

        <Row>
          <Col md={6}><Form.Group className="mb-3"><Form.Label>{t('image_url')}</Form.Label><Form.Control type="text" name="image" value={formData.image} onChange={handleChange} /></Form.Group></Col>
          <Col md={6}><Form.Group className="mb-3"><Form.Label>{t('country_or_region')}</Form.Label><Form.Select name="country_or_region" value={formData.country_or_region || ''} onChange={handleChange}><option value="">{t('select_country')}</option>{dependencies.countries.map(c => <option key={c._id} value={c._id}>{getLocalizedValue(c.name, i18n.language)}</option>)}</Form.Select></Form.Group></Col>
        </Row>
        <Row>
          <Col md={6}><Form.Group className="mb-3"><Form.Label>{t('cooking_time_minutes')}</Form.Label><Form.Control type="number" name="cookingTime" value={formData.cookingTime} onChange={handleChange} /></Form.Group></Col>
          <Col md={6}><Form.Group className="mb-3"><Form.Label>{t('servings')}</Form.Label><Form.Control type="number" name="servings" value={formData.servings} onChange={handleChange} /></Form.Group></Col>
        </Row>

        <Form.Group className="mt-3 mb-3">
          <Form.Check 
            type="switch"
            id="is-public-switch"
            label={t('make_public')}
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
          />
          <Form.Text className="text-muted">
            {t('make_public_description')}
          </Form.Text>
        </Form.Group>

        <h5 className="mt-3">{t('nutrition_facts')}</h5>
        <Row>
          <Col md={3}><Form.Group><Form.Label>{t('calorie')} (kcal)</Form.Label><Form.Control type="number" name="calorie" value={formData.calorie} onChange={handleChange} /></Form.Group></Col>
          <Col md={3}><Form.Group><Form.Label>{t('protein')} (g)</Form.Label><Form.Control type="number" name="protein" value={formData.protein} onChange={handleChange} /></Form.Group></Col>
          <Col md={3}><Form.Group><Form.Label>{t('carbohydrate')} (g)</Form.Label><Form.Control type="number" name="carbohydrate" value={formData.carbohydrate} onChange={handleChange} /></Form.Group></Col>
          <Col md={3}><Form.Group><Form.Label>{t('fat')} (g)</Form.Label><Form.Control type="number" name="fat" value={formData.fat} onChange={handleChange} /></Form.Group></Col>
        </Row>

        <h5 className="mt-4">{t('ingredients')}</h5>
        {formData.ingredients.map((ing, index) => (
          <Row key={index} className="mb-2 align-items-center">
            <Col md={3}><Form.Select name="ingredient" value={ing.ingredient} onChange={(e) => handleIngredientChange(index, e)} required><option value="">{t('select_ingredient')}</option>{dependencies.ingredients.map(i => <option key={i._id} value={i._id}>{getLocalizedValue(i.name, i18n.language)}</option>)}</Form.Select></Col>
            <Col md={2}><Form.Control type="number" name="quantity" placeholder={t('quantity')} value={ing.quantity} onChange={(e) => handleIngredientChange(index, e)} required /></Col>
            <Col md={2}><Form.Control type="text" name="unit" placeholder={t('unit')} value={ing.unit} onChange={(e) => handleIngredientChange(index, e)} required /></Col>
            <Col md={3}><Form.Select name="method" value={ing.method || ''} onChange={(e) => handleIngredientChange(index, e)}><option value="">{t('select_method')}</option>{dependencies.methods.map(m => <option key={m._id} value={m._id}>{getLocalizedValue(m.name, i18n.language)}</option>)}</Form.Select></Col>
            <Col md={1}><Form.Check type="checkbox" name="optional" label={t('optional_short')} checked={ing.optional} onChange={(e) => handleIngredientChange(index, e)} /></Col>
            <Col md={1}><Button variant="danger" size="sm" onClick={() => removeIngredient(index)}>X</Button></Col>
          </Row>
        ))}
        <Button variant="outline-primary" onClick={addIngredient} className="mt-2">{t('add_ingredient')}</Button>
        
        <div className="mt-4">
          <Button variant="primary" type="submit" className="me-2">{t('save_changes')}</Button>
          <Button variant="secondary" onClick={() => navigate('/my-recipes')}>{t('cancel')}</Button>
        </div>
      </Form>
    </Container>
  );
};

export default UserRecipeEdit;