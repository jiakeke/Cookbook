import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../utils/translationHelper';

const RecipeList = () => {
  const { t, i18n } = useTranslation();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/recipes`);
        setRecipes(res.data);
      } catch (err) {
        setError(t('fetch_recipes_failed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [t]);

  return (
    <Container>
      <h1 className="my-4">{t('recipes')}</h1>
      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Row>
          {recipes.map(recipe => (
            <Col key={recipe._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
              <Card className="h-100">
                <Card.Img variant="top" src={recipe.image || 'https://via.placeholder.com/150'} style={{ height: '200px', objectFit: 'cover' }} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{getLocalizedValue(recipe.name, i18n.language)}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {getLocalizedValue(recipe.country_or_region?.name, i18n.language)}
                  </Card.Subtitle>
                  <Card.Text as="div" className="flex-grow-1">
                    <small>{getLocalizedValue(recipe.description, i18n.language)?.substring(0, 100)}...</small>
                  </Card.Text>
                  <Link to={`/recipes/${recipe._id}`} className="mt-auto btn btn-primary">{t('view_details')}</Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default RecipeList;