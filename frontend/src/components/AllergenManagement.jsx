import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, Row, Col, Pagination, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DeleteConfirmModal from './DeleteConfirmModal';
import AllergenEditModal from './AllergenEditModal';
import AllergenCreateModal from './AllergenCreateModal';
import { getLocalizedValue } from '../utils/translationHelper';

const AllergenManagement = () => {
  const { t, i18n } = useTranslation();
  const [allergens, setAllergens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [allergenToDelete, setAllergenToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [allergenToEdit, setAllergenToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchAllergens = useCallback(async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/allergens?page=${pageNum}&search=${searchTerm}`);
      setAllergens(res.data.allergens || []);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
    } catch (err) {
      setError(t('fetch_allergens_failed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAllergens(page, search);
  }, [fetchAllergens, page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    setSearch(searchTerm);
    setPage(1);
  };

  // --- Delete Handlers ---
  const openDeleteModal = (allergen) => {
    setAllergenToDelete(allergen);
    setShowDeleteModal(true);
  };

  const confirmDeleteHandler = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/allergens/${allergenToDelete._id}`);
      setShowDeleteModal(false);
      setAllergenToDelete(null);
      setSuccess(t('allergen_deleted_success'));
      fetchAllergens(page, search);
    } catch (err) {
      setError(err.response?.data?.msg || t('allergen_deleted_failed'));
      console.error(err);
    }
  };

  // --- Edit Handlers ---
  const openEditModal = (allergen) => {
    setAllergenToEdit(allergen);
    setShowEditModal(true);
  };

  const handleAllergenUpdate = () => {
    setShowEditModal(false);
    setSuccess(t('allergen_updated_success'));
    fetchAllergens(page, search);
  };

  // --- Create Handlers ---
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleAllergenCreate = () => {
    setShowCreateModal(false);
    setSuccess(t('allergen_created_success'));
    fetchAllergens(1, '');
  };

  return (
    <div>
      <Row className="align-items-center mb-3">
        <Col><h1>{t('allergen_management')}</h1></Col>
        <Col className="text-end"><Button onClick={openCreateModal}>{t('create_allergen')}</Button></Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Form onSubmit={handleSearch} className="mb-3">
         <Row>
          <Col md={5}>
            <Form.Control type="text" name="search" placeholder={t('search_allergens_placeholder')} />
          </Col>
          <Col><Button type="submit">{t('search')}</Button></Col>
        </Row>
      </Form>

      {loading ? <Spinner animation="border" /> : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>{t('name')}</th>
                <th>{t('description')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(allergens || []).map(allergen => (
                <tr key={allergen._id}>
                  <td>{getLocalizedValue(allergen.name, i18n.language)}</td>
                  <td>{getLocalizedValue(allergen.description, i18n.language)}</td>
                  <td>
                    <Button variant="info" className="btn-sm" onClick={() => openEditModal(allergen)}>{t('edit')}</Button>{' '}
                    <Button variant="danger" className="btn-sm" onClick={() => openDeleteModal(allergen)}>{t('delete')}</Button>
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

      {allergenToDelete && (
        <DeleteConfirmModal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteHandler}
          title={t('delete_allergen_title')}
          body={`${t('delete_allergen_body')} ${getLocalizedValue(allergenToDelete.name, i18n.language)}?`}
        />
      )}

      {allergenToEdit && (
        <AllergenEditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          allergen={allergenToEdit}
          onAllergenUpdate={handleAllergenUpdate}
        />
      )}

      <AllergenCreateModal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onAllergenCreate={handleAllergenCreate}
      />
    </div>
  );
};

export default AllergenManagement;
