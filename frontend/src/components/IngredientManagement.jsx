import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, Row, Col, Pagination, Spinner, Alert, Image } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DeleteConfirmModal from './DeleteConfirmModal';
import IngredientEditModal from './IngredientEditModal';
import IngredientCreateModal from './IngredientCreateModal';
import { getLocalizedValue } from '../utils/translationHelper';

const IngredientManagement = () => {
  const { t, i18n } = useTranslation();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [ingredientToEdit, setIngredientToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchIngredients = useCallback(async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/ingredients?page=${pageNum}&search=${searchTerm}`);
      setIngredients(res.data.ingredients || []);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
    } catch (err) {
      setError(t('fetch_ingredients_failed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchIngredients(page, search);
  }, [fetchIngredients, page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    setSearch(searchTerm);
    setPage(1);
  };

  // --- Delete Handlers ---
  const openDeleteModal = (ingredient) => {
    setIngredientToDelete(ingredient);
    setShowDeleteModal(true);
  };

  const confirmDeleteHandler = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/ingredients/${ingredientToDelete._id}`);
      setShowDeleteModal(false);
      setIngredientToDelete(null);
      setSuccess(t('ingredient_deleted_success'));
      fetchIngredients(page, search);
    } catch (err) {
      setError(err.response?.data?.msg || t('ingredient_deleted_failed'));
      console.error(err);
    }
  };

  // --- Edit Handlers ---
  const openEditModal = (ingredient) => {
    setIngredientToEdit(ingredient);
    setShowEditModal(true);
  };

  const handleIngredientUpdate = () => {
    setShowEditModal(false);
    setSuccess(t('ingredient_updated_success'));
    fetchIngredients(page, search);
  };

  // --- Create Handlers ---
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleIngredientCreate = () => {
    setShowCreateModal(false);
    setSuccess(t('ingredient_created_success'));
    fetchIngredients(1, '');
  };

  return (
    <div>
      <Row className="align-items-center mb-3">
        <Col><h1>{t('ingredient_management')}</h1></Col>
        <Col className="text-end"><Button onClick={openCreateModal}>{t('create_ingredient')}</Button></Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Form onSubmit={handleSearch} className="mb-3">
         <Row>
          <Col md={5}>
            <Form.Control type="text" name="search" placeholder={t('search_ingredients_placeholder')} />
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
                <th>{t('purchase_links')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(ingredients || []).map(ingredient => (
                <tr key={ingredient._id}>
                  <td><Image src={ingredient.image} alt={getLocalizedValue(ingredient.name, i18n.language)} style={{ width: '50px', height: 'auto' }} thumbnail /></td>
                  <td>{getLocalizedValue(ingredient.name, i18n.language)}</td>
                  <td>{ingredient.link?.length || 0}</td>
                  <td>
                    <Button variant="info" className="btn-sm" onClick={() => openEditModal(ingredient)}>{t('edit')}</Button>{' '}
                    <Button variant="danger" className="btn-sm" onClick={() => openDeleteModal(ingredient)}>{t('delete')}</Button>
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

      {ingredientToDelete && (
        <DeleteConfirmModal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteHandler}
          title={t('delete_ingredient_title')}
          body={`${t('delete_ingredient_body')} ${getLocalizedValue(ingredientToDelete.name, i18n.language)}?`}
        />
      )}

      {ingredientToEdit && (
        <IngredientEditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          ingredient={ingredientToEdit}
          onIngredientUpdate={handleIngredientUpdate}
        />
      )}

      <IngredientCreateModal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onIngredientCreate={handleIngredientCreate}
      />
    </div>
  );
};

export default IngredientManagement;