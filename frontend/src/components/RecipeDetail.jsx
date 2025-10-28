import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Spinner, Alert, Card, ListGroup, Table, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../utils/translationHelper';
import CommentSection from './CommentSection';

const RecipeDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/recipes/${id}`);
        setRecipe(res.data);
      } catch (err) {
        setError(t('fetch_recipes_failed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, t]);

  if (loading) {
    return <div className="text-center"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <Container><Alert variant="danger">{error}</Alert></Container>;
  }

  if (!recipe) {
    return <Container><Alert variant="warning">{t('recipe_not_found')}</Alert></Container>;
  }

  const renderPurchaseLinks = () => {
    const allLinks = recipe.ingredients.flatMap(ing => 
      ing.ingredient.link.map(l => ({ ...l, ingredientName: ing.ingredient.name, ingredientImage: ing.ingredient.image }))
    );

    if (allLinks.length === 0) return null;

    return (
      <>
        <h3 className="mt-4">{t('purchase_links')}</h3>
        <Row>
          {allLinks.map(link => (
            <Col key={link._id} sm={12} md={6} lg={4} className="mb-3">
              <Card>
                <Card.Img variant="top" src={link.ingredientImage || 'https://via.placeholder.com/150'} style={{ height: '150px', objectFit: 'cover' }} />
                <Card.Body>
                  <Card.Title>{getLocalizedValue(link.ingredientName, i18n.language)}</Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item>{t('price')}: {link.price} &euro;</ListGroup.Item>
                    {link.pricePerKg && <ListGroup.Item>{t('price_per_kg')}: {link.pricePerKg} &euro;</ListGroup.Item>}
                    <ListGroup.Item>{t('size_spec')}: {link.size}</ListGroup.Item>
                    <ListGroup.Item>{t('store')}: {getLocalizedValue(link.store.name, i18n.language)}</ListGroup.Item>
                  </ListGroup>
                  <a href={link.uri} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-2">{t('add_to_cart')}</a>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </>
    );
  }

  return (
    <Container className="my-4">
      {/* Header */}
      <Row className="mb-4">
        <Col md={4}>
          <Image src={recipe.image || 'https://via.placeholder.com/300'} fluid rounded />
        </Col>
        <Col md={8}>
          <h1>{getLocalizedValue(recipe.name, i18n.language)}</h1>
          <p className="text-muted">{getLocalizedValue(recipe.country_or_region?.name, i18n.language)}</p>
          <p>{getLocalizedValue(recipe.description, i18n.language)}</p>
        </Col>
      </Row>

      {/* Nutrition */}
      <Card className="mb-4">
        <Card.Header as="h3">{t('nutrition_facts')}</Card.Header>
        <Card.Body>
          <Row className="text-center">
            <Col>{t('calorie')}: {recipe.calorie || 'N/A'} kcal</Col>
            <Col>{t('protein')}: {recipe.protein || 'N/A'} g</Col>
            <Col>{t('carbohydrate')}: {recipe.carbohydrate || 'N/A'} g</Col>
            <Col>{t('fat')}: {recipe.fat || 'N/A'} g</Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Servings */}
      <h3 className="mt-4">{t('servings')}</h3>
      <p>{recipe.servings || 'N/A'}</p>

      {/* Ingredients */}
      <h3 className="mt-4">{t('ingredients')}</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>{t('quantity')}</th>
            <th>{t('unit')}</th>
            <th>{t('name')}</th>
            <th>{t('method')}</th>
          </tr>
        </thead>
        <tbody>
          {recipe.ingredients.map((ing, index) => (
            <tr key={index}>
              <td>{ing.quantity}</td>
              <td>{ing.unit}</td>
              <td>
                {getLocalizedValue(ing.ingredient.name, i18n.language)}{' '}
                {ing.optional && <Badge bg="secondary">{t('optional')}</Badge>}
              </td>
              <td>{getLocalizedValue(ing.method?.name, i18n.language)}</td>
              <td>
                {ing.ingredient.allergens?.map(a => <Badge key={a._id} bg="warning" className="me-1">{getLocalizedValue(a.name, i18n.language)}</Badge>)}
                {ing.ingredient.specials?.map(s => <Badge key={s._id} bg="info" className="me-1">{getLocalizedValue(s.name, i18n.language)}</Badge>)}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Preparation */}
      <h3 className="mt-4">{t('preparation')}</h3>
      <div style={{ whiteSpace: 'pre-wrap' }} className="mb-3">
        {getLocalizedValue(recipe.preparation, i18n.language)}
      </div>

      {/* Cooking Time */}
      <h3 className="mt-4">{t('cookingTime')}</h3>
      <p>{recipe.cookingTime ? `${recipe.cookingTime} ${t('minutes', 'minutes')}` : 'N/A'}</p>

      {/* Remark */}
      {getLocalizedValue(recipe.remark, i18n.language) && (
        <>
          <h3 className="mt-4">{t('remark')}</h3>
          <div style={{ whiteSpace: 'pre-wrap' }} className="mb-3">
            {getLocalizedValue(recipe.remark, i18n.language)}
          </div>
        </>
      )}

      {/* Purchase Links */}
      {renderPurchaseLinks()}

      {/* Comments */}
      <CommentSection recipe={recipe} onCommentsUpdate={(newComment) => setRecipe({...recipe, comments: [newComment, ...recipe.comments]})}/>

      {/* Timestamps */}
      <div className="text-muted text-end mt-4">
        <small>{t('created_at')}: {new Date(recipe.createdAt).toLocaleString()}</small><br />
        <small>{t('modified_at')}: {new Date(recipe.updatedAt).toLocaleString()}</small>
      </div>

    </Container>
  );
};

export default RecipeDetail;