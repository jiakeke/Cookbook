import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, Row, Col, Pagination, Spinner, Alert, Image } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DeleteConfirmModal from './DeleteConfirmModal';
import StoreEditModal from './StoreEditModal';
import StoreCreateModal from './StoreCreateModal';
import { getLocalizedValue } from '../utils/translationHelper';

const StoreManagement = () => {
  const { t, i18n } = useTranslation();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchStores = useCallback(async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stores?page=${pageNum}&search=${searchTerm}`);
      setStores(res.data.stores || []);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
    } catch (err) {
      setError(t('fetch_stores_failed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStores(page, search);
  }, [fetchStores, page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    setSearch(searchTerm);
    setPage(1);
  };

  // --- Delete Handlers ---
  const openDeleteModal = (store) => {
    setStoreToDelete(store);
    setShowDeleteModal(true);
  };

  const confirmDeleteHandler = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stores/${storeToDelete._id}`);
      setShowDeleteModal(false);
      setStoreToDelete(null);
      setSuccess(t('store_deleted_success'));
      fetchStores(page, search);
    } catch (err) {
      setError(err.response?.data?.msg || t('store_deleted_failed'));
      console.error(err);
    }
  };

  // --- Edit Handlers ---
  const openEditModal = (store) => {
    setStoreToEdit(store);
    setShowEditModal(true);
  };

  const handleStoreUpdate = () => {
    setShowEditModal(false);
    setSuccess(t('store_updated_success'));
    fetchStores(page, search);
  };

  // --- Create Handlers ---
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleStoreCreate = () => {
    setShowCreateModal(false);
    setSuccess(t('store_created_success'));
    fetchStores(1, '');
  };

  return (
    <div>
      <Row className="align-items-center mb-3">
        <Col><h1>{t('store_management')}</h1></Col>
        <Col className="text-end"><Button onClick={openCreateModal}>{t('create_store')}</Button></Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Form onSubmit={handleSearch} className="mb-3">
         <Row>
          <Col md={5}>
            <Form.Control type="text" name="search" placeholder={t('search_stores_placeholder')} />
          </Col>
          <Col><Button type="submit">{t('search')}</Button></Col>
        </Row>
      </Form>

      {loading ? <Spinner animation="border" /> : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>{t('logo')}</th>
                <th>{t('name')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(stores || []).map(store => (
                <tr key={store._id}>
                  <td><Image src={store.logo} alt={getLocalizedValue(store.name, i18n.language)} style={{ width: '50px', height: 'auto' }} thumbnail /></td>
                  <td>{getLocalizedValue(store.name, i18n.language)}</td>
                  <td>
                    <Button variant="info" className="btn-sm" onClick={() => openEditModal(store)}>{t('edit')}</Button>{' '}
                    <Button variant="danger" className="btn-sm" onClick={() => openDeleteModal(store)}>{t('delete')}</Button>
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

      {storeToDelete && (
        <DeleteConfirmModal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteHandler}
          title={t('delete_store_title')}
          body={`${t('delete_store_body')} ${getLocalizedValue(storeToDelete.name, i18n.language)}?`}
        />
      )}

      {storeToEdit && (
        <StoreEditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          store={storeToEdit}
          onStoreUpdate={handleStoreUpdate}
        />
      )}

      <StoreCreateModal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onStoreCreate={handleStoreCreate}
      />
    </div>
  );
};

export default StoreManagement;
