import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const ReportModal = ({ show, onHide, commentId, onReportSubmitted }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError(t('reason_is_required'));
      return;
    }
    setLoading(true);
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/reports/${commentId}`, { reason });
      onReportSubmitted();
      handleHide();
    } catch (err) {
      const errorMsg = err.response?.data?.msg || t('report_failed');
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHide = () => {
    setReason('');
    setError('');
    onHide();
  }

  return (
    <Modal show={show} onHide={handleHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{t('report_comment')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group>
            <Form.Label>{t('reason')}</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={4} 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleHide}>{t('cancel')}</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner as="span" size="sm" /> : t('report')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ReportModal;
