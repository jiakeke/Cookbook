import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../utils/translationHelper';

const IngredientList = () => {
  const { t, i18n } = useTranslation();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIngredients = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/ingredients`);
        setIngredients(res.data);
      } catch (err) {
        setError(t('fetch_ingredients_failed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, [t]);

  return (
    <Container>
      <h1 className="my-4">{t('ingredients')}</h1>
      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Row>
          {ingredients.map(ingredient => (
            <Col key={ingredient._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
              <Card className="h-100">
                <Card.Img variant="top" src={ingredient.image || 'https://via.placeholder.com/150'} style={{ height: '200px', objectFit: 'cover' }} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{getLocalizedValue(ingredient.name, i18n.language)}</Card.Title>
                  <Link to={`/ingredients/${ingredient._id}`} className="mt-auto btn btn-primary">{t('view_details')}</Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default IngredientList;
