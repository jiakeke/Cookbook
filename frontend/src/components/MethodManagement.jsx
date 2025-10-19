import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, Row, Col, Pagination, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DeleteConfirmModal from './DeleteConfirmModal';
import MethodEditModal from './MethodEditModal';
import MethodCreateModal from './MethodCreateModal';
import { getLocalizedValue } from '../utils/translationHelper';

const MethodManagement = () => {
  const { t, i18n } = useTranslation();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [methodToEdit, setMethodToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchMethods = useCallback(async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/methods?page=${pageNum}&search=${searchTerm}`);
      setMethods(res.data.methods || []);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
    } catch (err) {
      setError(t('fetch_methods_failed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMethods(page, search);
  }, [fetchMethods, page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    setSearch(searchTerm);
    setPage(1);
  };

  // --- Delete Handlers ---
  const openDeleteModal = (method) => {
    setMethodToDelete(method);
    setShowDeleteModal(true);
  };

  const confirmDeleteHandler = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/methods/${methodToDelete._id}`);
      setShowDeleteModal(false);
      setMethodToDelete(null);
      setSuccess(t('method_deleted_success'));
      fetchMethods(page, search);
    } catch (err) {
      setError(err.response?.data?.msg || t('method_deleted_failed'));
      console.error(err);
    }
  };

  // --- Edit Handlers ---
  const openEditModal = (method) => {
    setMethodToEdit(method);
    setShowEditModal(true);
  };

  const handleMethodUpdate = () => {
    setShowEditModal(false);
    setSuccess(t('method_updated_success'));
    fetchMethods(page, search);
  };

  // --- Create Handlers ---
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleMethodCreate = () => {
    setShowCreateModal(false);
    setSuccess(t('method_created_success'));
    fetchMethods(1, '');
  };

  return (
    <div>
      <Row className="align-items-center mb-3">
        <Col><h1>{t('method_management')}</h1></Col>
        <Col className="text-end"><Button onClick={openCreateModal}>{t('create_method')}</Button></Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Form onSubmit={handleSearch} className="mb-3">
         <Row>
          <Col md={5}>
            <Form.Control type="text" name="search" placeholder={t('search_methods_placeholder')} />
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
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(methods || []).map(method => (
                <tr key={method._id}>
                  <td>{getLocalizedValue(method.name, i18n.language)}</td>
                  <td>
                    <Button variant="info" className="btn-sm" onClick={() => openEditModal(method)}>{t('edit')}</Button>{' '}
                    <Button variant="danger" className="btn-sm" onClick={() => openDeleteModal(method)}>{t('delete')}</Button>
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

      {methodToDelete && (
        <DeleteConfirmModal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteHandler}
          title={t('delete_method_title')}
          body={`${t('delete_method_body')} ${getLocalizedValue(methodToDelete.name, i18n.language)}?`}
        />
      )}

      {methodToEdit && (
        <MethodEditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          method={methodToEdit}
          onMethodUpdate={handleMethodUpdate}
        />
      )}

      <MethodCreateModal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onMethodCreate={handleMethodCreate}
      />
    </div>
  );
};

export default MethodManagement;
