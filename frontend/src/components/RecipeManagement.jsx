import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, Row, Col, Pagination, Spinner, Alert, Image } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DeleteConfirmModal from './DeleteConfirmModal';
import RecipeEditModal from './RecipeEditModal';
import RecipeCreateModal from './RecipeCreateModal';
import { getLocalizedValue } from '../utils/translationHelper';

const RecipeManagement = () => {
  const { t, i18n } = useTranslation();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchRecipes = useCallback(async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/recipes?page=${pageNum}&search=${searchTerm}`);
      setRecipes(res.data.recipes || []);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
    } catch (err) {
      setError(t('fetch_recipes_failed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRecipes(page, search);
  }, [fetchRecipes, page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    setSearch(searchTerm);
    setPage(1);
  };

  // --- Delete Handlers ---
  const openDeleteModal = (recipe) => {
    setRecipeToDelete(recipe);
    setShowDeleteModal(true);
  };

  const confirmDeleteHandler = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/recipes/${recipeToDelete._id}`);
      setShowDeleteModal(false);
      setRecipeToDelete(null);
      setSuccess(t('recipe_deleted_success'));
      fetchRecipes(page, search);
    } catch (err) {
      setError(err.response?.data?.msg || t('recipe_deleted_failed'));
      console.error(err);
    }
  };

  // --- Edit Handlers ---
  const openEditModal = (recipe) => {
    setRecipeToEdit(recipe);
    setShowEditModal(true);
  };

  const handleRecipeUpdate = () => {
    setShowEditModal(false);
    setSuccess(t('recipe_updated_success'));
    fetchRecipes(page, search);
  };

  // --- Create Handlers ---
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleRecipeCreate = () => {
    setShowCreateModal(false);
    setSuccess(t('recipe_created_success'));
    fetchRecipes(1, '');
  };

  return (
    <div>
      <Row className="align-items-center mb-3">
        <Col><h1>{t('recipe_management')}</h1></Col>
        <Col className="text-end"><Button onClick={openCreateModal}>{t('create_recipe')}</Button></Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Form onSubmit={handleSearch} className="mb-3">
         <Row>
          <Col md={5}>
            <Form.Control type="text" name="search" placeholder={t('search_recipes_placeholder')} />
          </Col>
          <Col><Button type="submit">{t('search')}</Button></Col>
        </Row>
      </Form>

      {loading ? <Spinner animation="border" /> : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>{t('image')}</th>
                <th>{t('name')}</th>
                <th>{t('country_or_region')}</th>
                <th>{t('ingredients_count')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(recipes || []).map(recipe => (
                <tr key={recipe._id}>
                  <td><Image src={recipe.image} alt={getLocalizedValue(recipe.name, i18n.language)} style={{ width: '50px', height: 'auto' }} thumbnail /></td>
                  <td>{getLocalizedValue(recipe.name, i18n.language)}</td>
                  <td>{getLocalizedValue(recipe.country_or_region?.name, i18n.language)}</td>
                  <td>{recipe.ingredients?.length}</td>
                  <td>
                    <Button variant="info" className="btn-sm" onClick={() => openEditModal(recipe)}>{t('edit')}</Button>{' '}
                    <Button variant="danger" className="btn-sm" onClick={() => openDeleteModal(recipe)}>{t('delete')}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination>
            {[...Array(pages || 1).keys()].map(x => (
              <Pagination.Item key={x + 1} active={x + 1 === page} onClick={() => setPage(x + 1)}>
                {x + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </>
      )}

      {recipeToDelete && (
        <DeleteConfirmModal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteHandler}
          title={t('delete_recipe_title')}
          body={`${t('delete_recipe_body')} ${getLocalizedValue(recipeToDelete.name, i18n.language)}?`}
        />
      )}
      
      {recipeToEdit && (
        <RecipeEditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          recipe={recipeToEdit}
          onRecipeUpdate={handleRecipeUpdate}
        />
      )}

      <RecipeCreateModal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onRecipeCreate={handleRecipeCreate}
      />
    </div>
  );
};

export default RecipeManagement;
