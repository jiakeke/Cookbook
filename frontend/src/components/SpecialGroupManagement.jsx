import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, Row, Col, Pagination, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DeleteConfirmModal from './DeleteConfirmModal';
import SpecialGroupEditModal from './SpecialGroupEditModal';
import SpecialGroupCreateModal from './SpecialGroupCreateModal';
import { getLocalizedValue } from '../utils/translationHelper';

const SpecialGroupManagement = () => {
  const { t, i18n } = useTranslation();
  const [specialGroups, setSpecialGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [specialGroupToDelete, setSpecialGroupToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [specialGroupToEdit, setSpecialGroupToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchSpecialGroups = useCallback(async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/specialgroups?page=${pageNum}&search=${searchTerm}`);
      setSpecialGroups(res.data.specialgroups || []);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
    } catch (err) {
      setError(t('fetch_special_groups_failed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSpecialGroups(page, search);
  }, [fetchSpecialGroups, page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    setSearch(searchTerm);
    setPage(1);
  };

  // --- Delete Handlers ---
  const openDeleteModal = (specialGroup) => {
    setSpecialGroupToDelete(specialGroup);
    setShowDeleteModal(true);
  };

  const confirmDeleteHandler = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/specialgroups/${specialGroupToDelete._id}`);
      setShowDeleteModal(false);
      setSpecialGroupToDelete(null);
      setSuccess(t('special_group_deleted_success'));
      fetchSpecialGroups(page, search);
    } catch (err) {
      setError(err.response?.data?.msg || t('special_group_deleted_failed'));
      console.error(err);
    }
  };

  // --- Edit Handlers ---
  const openEditModal = (specialGroup) => {
    setSpecialGroupToEdit(specialGroup);
    setShowEditModal(true);
  };

  const handleSpecialGroupUpdate = () => {
    setShowEditModal(false);
    setSuccess(t('special_group_updated_success'));
    fetchSpecialGroups(page, search);
  };

  // --- Create Handlers ---
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleSpecialGroupCreate = () => {
    setShowCreateModal(false);
    setSuccess(t('special_group_created_success'));
    fetchSpecialGroups(1, '');
  };

  return (
    <div>
      <Row className="align-items-center mb-3">
        <Col><h1>{t('special_group_management')}</h1></Col>
        <Col className="text-end"><Button onClick={openCreateModal}>{t('create_special_group')}</Button></Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Form onSubmit={handleSearch} className="mb-3">
         <Row>
          <Col md={5}>
            <Form.Control type="text" name="search" placeholder={t('search_special_groups_placeholder')} />
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
              {(specialGroups || []).map(specialGroup => (
                <tr key={specialGroup._id}>
                  <td>{getLocalizedValue(specialGroup.name, i18n.language)}</td>
                  <td>{getLocalizedValue(specialGroup.description, i18n.language)}</td>
                  <td>
                    <Button variant="info" className="btn-sm" onClick={() => openEditModal(specialGroup)}>{t('edit')}</Button>{' '}
                    <Button variant="danger" className="btn-sm" onClick={() => openDeleteModal(specialGroup)}>{t('delete')}</Button>
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

      {specialGroupToDelete && (
        <DeleteConfirmModal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteHandler}
          title={t('delete_special_group_title')}
          body={`${t('delete_special_group_body')} ${getLocalizedValue(specialGroupToDelete.name, i18n.language)}?`}
        />
      )}

      {specialGroupToEdit && (
        <SpecialGroupEditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          specialGroup={specialGroupToEdit}
          onSpecialGroupUpdate={handleSpecialGroupUpdate}
        />
      )}

      <SpecialGroupCreateModal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSpecialGroupCreate={handleSpecialGroupCreate}
      />
    </div>
  );
};

export default SpecialGroupManagement;
