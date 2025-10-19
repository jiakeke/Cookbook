import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, Row, Col, Pagination, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DeleteConfirmModal from './DeleteConfirmModal';
import CountryOrRegionEditModal from './CountryOrRegionEditModal';
import CountryOrRegionCreateModal from './CountryOrRegionCreateModal';
import { getLocalizedValue } from '../utils/translationHelper';

const CountryOrRegionManagement = () => {
  const { t, i18n } = useTranslation();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [countryToEdit, setCountryToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchCountries = useCallback(async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/countries?page=${pageNum}&search=${searchTerm}`);
      setCountries(res.data.countries || []);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
    } catch (err) {
      setError(t('fetch_countries_failed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCountries(page, search);
  }, [fetchCountries, page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    setSearch(searchTerm);
    setPage(1);
  };

  // --- Delete Handlers ---
  const openDeleteModal = (country) => {
    setCountryToDelete(country);
    setShowDeleteModal(true);
  };

  const confirmDeleteHandler = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/countries/${countryToDelete._id}`);
      setShowDeleteModal(false);
      setCountryToDelete(null);
      setSuccess(t('country_deleted_success'));
      fetchCountries(page, search);
    } catch (err) {
      setError(err.response?.data?.msg || t('country_deleted_failed'));
      console.error(err);
    }
  };

  // --- Edit Handlers ---
  const openEditModal = (country) => {
    setCountryToEdit(country);
    setShowEditModal(true);
  };

  const handleCountryUpdate = () => {
    setShowEditModal(false);
    setSuccess(t('country_updated_success'));
    fetchCountries(page, search);
  };

  // --- Create Handlers ---
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCountryCreate = () => {
    setShowCreateModal(false);
    setSuccess(t('country_created_success'));
    fetchCountries(1, '');
  };

  return (
    <div>
      <Row className="align-items-center mb-3">
        <Col><h1>{t('country_management')}</h1></Col>
        <Col className="text-end"><Button onClick={openCreateModal}>{t('create_country')}</Button></Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Form onSubmit={handleSearch} className="mb-3">
         <Row>
          <Col md={5}>
            <Form.Control type="text" name="search" placeholder={t('search_countries_placeholder')} />
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
              {(countries || []).map(country => (
                <tr key={country._id}>
                  <td>{getLocalizedValue(country.name, i18n.language)}</td>
                  <td>{getLocalizedValue(country.description, i18n.language)}</td>
                  <td>
                    <Button variant="info" className="btn-sm" onClick={() => openEditModal(country)}>{t('edit')}</Button>{' '}
                    <Button variant="danger" className="btn-sm" onClick={() => openDeleteModal(country)}>{t('delete')}</Button>
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

      {countryToDelete && (
        <DeleteConfirmModal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteHandler}
          title={t('delete_country_title')}
          body={`${t('delete_country_body')} ${getLocalizedValue(countryToDelete.name, i18n.language)}?`}
        />
      )}

      {countryToEdit && (
        <CountryOrRegionEditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          country={countryToEdit}
          onCountryUpdate={handleCountryUpdate}
        />
      )}

      <CountryOrRegionCreateModal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onCountryCreate={handleCountryCreate}
      />
    </div>
  );
};

export default CountryOrRegionManagement;
