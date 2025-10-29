import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const ReportManagement = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/reports`);
      setReports(res.data || []);
    } catch (err) {
      setError(t('fetch_reports_failed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateStatus = async (reportId, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/reports/${reportId}`, { status });
      setSuccess(t('report_updated_successfully'));
      fetchReports(); // Re-fetch the sorted list from the server
    } catch (err) {
      setError(err.response?.data?.msg || t('update_report_failed'));
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New': return <Badge bg="primary">{t('status_new')}</Badge>;
      case 'Accepted': return <Badge bg="success">{t('status_accepted')}</Badge>;
      case 'Rejected': return <Badge bg="danger">{t('status_rejected')}</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getActionButtons = (report) => {
    switch (report.status) {
      case 'New':
        return (
          <>
            <Button variant="success" size="sm" onClick={() => handleUpdateStatus(report._id, 'Accepted')}>{t('action_accept')}</Button>{' '}
            <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(report._id, 'Rejected')}>{t('action_reject')}</Button>
          </>
        );
      case 'Accepted':
        return (
          <>
            <Button variant="warning" size="sm" onClick={() => handleUpdateStatus(report._id, 'New')}>{t('action_reopen')}</Button>{' '}
            <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(report._id, 'Rejected')}>{t('action_reject')}</Button>
          </>
        );
      case 'Rejected':
        return (
          <>
            <Button variant="warning" size="sm" onClick={() => handleUpdateStatus(report._id, 'New')}>{t('action_reopen')}</Button>{' '}
            <Button variant="success" size="sm" onClick={() => handleUpdateStatus(report._id, 'Accepted')}>{t('action_accept')}</Button>
          </>
        );
      default: return null;
    }
  }

  return (
    <div>
      <h1>{t('report_management')}</h1>
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {loading ? <Spinner animation="border" /> : (
        <Table striped bordered hover responsive className="table-sm mt-3">
          <thead>
            <tr>
              <th>{t('reported_comment')}</th>
              <th>{t('reason')}</th>
              <th>{t('reported_by')}</th>
              <th>{t('status')}</th>
              <th>{t('created_at')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? reports.map(report => (
              <tr key={report._id}>
                <td>{report.comment?.content}</td>
                <td>{report.reason}</td>
                <td>{report.user?.name}</td>
                <td>{getStatusBadge(report.status)}</td>
                <td>{new Date(report.createdAt).toLocaleString()}</td>
                <td>{getActionButtons(report)}</td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="text-center">{t('no_reports')}</td></tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ReportManagement;