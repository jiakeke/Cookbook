import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const DeleteConfirmModal = ({ show, onHide, onConfirm, title, body }) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t('cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {t('confirm_delete')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmModal;
