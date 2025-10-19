import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, Row, Col, Pagination, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DeleteConfirmModal from './DeleteConfirmModal';
import UserEditModal from './UserEditModal';
import UserCreateModal from './UserCreateModal';

const UserManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchUsers = useCallback(async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users?page=${pageNum}&search=${searchTerm}`);
      setUsers(res.data.users || []); // Fallback to empty array
      setPage(res.data.page || 1); // Fallback to 1
      setPages(res.data.pages || 1); // Fallback to 1
    } catch (err) {
      setError(t('fetch_users_failed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers(page, search);
  }, [fetchUsers, page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    setSearch(searchTerm);
    setPage(1);
  };

  // --- Delete Handlers ---
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteHandler = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userToDelete._id}`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      setSuccess(t('user_deleted_success'));
      fetchUsers(page, search);
    } catch (err) {
      setError(err.response?.data?.msg || t('user_deleted_failed'));
      console.error(err);
    }
  };

  // --- Edit Handlers ---
  const openEditModal = (user) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const handleUserUpdate = () => {
    setShowEditModal(false);
    setSuccess(t('user_updated_success'));
    fetchUsers(page, search);
  };

  // --- Create Handlers ---
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleUserCreate = () => {
    setShowCreateModal(false);
    setSuccess(t('user_created_success'));
    fetchUsers(1, ''); // Go to first page to see the new user
  };

  return (
    <div>
      <Row className="align-items-center mb-3">
        <Col><h1>{t('user_management')}</h1></Col>
        <Col className="text-end"><Button onClick={openCreateModal}>{t('create_user')}</Button></Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Form onSubmit={handleSearch} className="mb-3">
         <Row>
          <Col md={5}>
            <Form.Control type="text" name="search" placeholder={t('search_users_placeholder')} />
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
                <th>{t('email_address')}</th>
                <th>{t('role')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td><span className={`badge bg-${user.role === 'admin' ? 'success' : 'secondary'}`}>{user.role}</span></td>
                  <td>
                    <Button variant="info" className="btn-sm" onClick={() => openEditModal(user)}>{t('edit')}</Button>{' '}
                    <Button variant="danger" className="btn-sm" onClick={() => openDeleteModal(user)}>{t('delete')}</Button>
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

      {userToDelete && (
        <DeleteConfirmModal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteHandler}
          title={t('delete_user_title')}
          body={`${t('delete_user_body')} ${userToDelete.name} (${userToDelete.email})?`}
        />
      )}

      {userToEdit && (
        <UserEditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          user={userToEdit}
          onUserUpdate={handleUserUpdate}
        />
      )}

      <UserCreateModal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onUserCreate={handleUserCreate}
      />
    </div>
  );
};

export default UserManagement;
