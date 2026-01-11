import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { getLocalizedValue } from '../utils/translationHelper';

const MyRecipes = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyRecipes = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/my-recipes`, config);
        setMyRecipes(res.data);
      } catch (err) {
        setError(t('fetch_recipes_failed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyRecipes();
    }
  }, [token, t]);

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="my-4">
      <h1 className="mb-4">{t('my_favorited_recipes')}</h1>
      <Row>
        {myRecipes.length > 0 ? myRecipes.map(recipe => (
          <Col key={recipe._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
            <Card className="h-100">
              <Card.Img variant="top" src={recipe.image || 'https://via.placeholder.com/150'} style={{ height: '200px', objectFit: 'cover' }} />
              <Card.Body className="d-flex flex-column">
                <Card.Title>
                  {getLocalizedValue(recipe.name, i18n.language)}
                  <Badge bg={recipe.isPublic ? "success" : "secondary"} className="ms-2">
                    {recipe.isPublic ? t('public') : t('private')}
                  </Badge>
                </Card.Title>
                <div className="mt-auto">
                  <Link to={`/recipes/${recipe._id}`} className="btn btn-secondary btn-sm me-2">{t('view_recipe')}</Link>
                  <Link to={`/my-recipes/${recipe._id}/edit`} className="btn btn-info btn-sm">{t('edit_recipe')}</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )) : <p>{t('no_favorited_recipes')}</p>}
      </Row>
    </Container>
  );
};

export default MyRecipes;
