import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Image, Spinner, Alert, Card, ListGroup, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../utils/translationHelper';
import { CartContext } from '../context/CartContext';
import { FaStore } from 'react-icons/fa';

const IngredientDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState({ ingredient: null, recipes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchIngredientDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/ingredients/${id}`);
        setData(res.data);
      } catch (err) {
        setError(t('fetch_ingredient_details_failed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredientDetails();
  }, [id, t]);

  if (loading) {
    return <div className="text-center"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <Container><Alert variant="danger">{error}</Alert></Container>;
  }

  if (!data.ingredient) {
    return <Container><Alert variant="warning">{t('ingredient_not_found')}</Alert></Container>;
  }

  const { ingredient, recipes } = data;

  const renderPurchaseLinks = () => {
    if (!ingredient.link || ingredient.link.length === 0) {
      return <p>{t('no_purchase_links_available')}</p>;
    }

    const handleAddToCart = (link) => {
      const recipeInfos = recipes.map(r => ({ id: r._id, name: r.name }));
      const itemToAdd = {
        ...link,
        ingredientName: ingredient.name,
        ingredientImage: ingredient.image,
      };
      addToCart(itemToAdd, recipeInfos);
      alert(`${getLocalizedValue(ingredient.name, i18n.language)} (${getLocalizedValue(link.store.name, i18n.language)}) ${t('added_to_cart_alert')}`);
    };

    return (
      <Row>
        {ingredient.link.map(link => (
          <Col key={link._id} sm={12} md={6} lg={4} className="mb-3">
            <Card>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>{t('price')}: {link.price} &euro;</ListGroup.Item>
                  {link.pricePerKg && <ListGroup.Item>{t('price_per_kg')}: {link.pricePerKg} &euro;</ListGroup.Item>}
                  <ListGroup.Item>{t('size_spec')}: {link.size}</ListGroup.Item>
                </ListGroup>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <Button variant="primary" onClick={() => handleAddToCart(link)}>{t('add_to_cart')}</Button>
                  <a href={link.uri} target="_blank" rel="noopener noreferrer">
                    {link.store.logo ? (
                      <Image
                        src={link.store.logo}
                        alt={getLocalizedValue(link.store.name, i18n.language)}
                        style={{ height: '30px', maxWidth: '100px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <FaStore size={30} title={getLocalizedValue(link.store.name, i18n.language)} />
                    )}
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderRelatedRecipes = () => {
    if (!recipes || recipes.length === 0) {
      return <p>{t('no_recipes_use_this_ingredient')}</p>;
    }

    return (
      <Row>
        {recipes.map(recipe => (
          <Col key={recipe._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
            <Card className="h-100">
              <Card.Img variant="top" src={recipe.image || 'https://via.placeholder.com/150'} style={{ height: '200px', objectFit: 'cover' }} />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{getLocalizedValue(recipe.name, i18n.language)}</Card.Title>
                <Link to={`/recipes/${recipe._id}`} className="mt-auto btn btn-secondary">{t('view_recipe')}</Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col md={4}>
          <Image src={ingredient.image || 'https://via.placeholder.com/300'} fluid rounded />
        </Col>
        <Col md={8}>
          <h1>{getLocalizedValue(ingredient.name, i18n.language)}</h1>
          {/* Display other ingredient details if needed, e.g., allergens */}
        </Col>
      </Row>

      <h3 className="mt-4">{t('purchase_links')}</h3>
      {renderPurchaseLinks()}

      <h3 className="mt-5">{t('recipes_using_this_ingredient')}</h3>
      {renderRelatedRecipes()}
    </Container>
  );
};

export default IngredientDetail;