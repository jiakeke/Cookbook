import React, { useState } from 'react';
import { Form, Button, Row, Col, Image, Spinner, Alert, Modal, Card } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// --- Comment Form Component ---
const CommentForm = ({ recipeId, onCommentPosted }) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setError(''); // Clear previous errors
    const selectedFiles = Array.from(e.target.files);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    const validFiles = selectedFiles.filter(file => {
      if (allowedTypes.includes(file.type)) {
        return true;
      } else {
        setError(`${t('invalid_file_type')}: ${file.name}`);
        return false;
      }
    });

    if (files.length + validFiles.length > 10) {
      setError(t('max_10_images'));
      return;
    }

    setFiles([...files, ...validFiles]);
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    // Clean up object URL
    URL.revokeObjectURL(previews[index]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError(t('comment_content_required'));
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('content', content);
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/comments/${recipeId}`, formData);
      onCommentPosted(res.data);
      // Reset form
      setContent('');
      setFiles([]);
      previews.forEach(p => URL.revokeObjectURL(p));
      setPreviews([]);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || t('comment_post_failed');
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <Card.Body>
        <Card.Title as="h4">{t('leave_a_comment')}</Card.Title>
        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Control 
              as="textarea" 
              rows={3} 
              placeholder={t('write_your_comment')} 
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Form.Group>

          <Row className="mb-3">
            {previews.map((src, i) => (
              <Col key={i} xs={4} md={2} className="position-relative mb-2">
                <Image src={src} thumbnail />
                <Button variant="danger" size="sm" className="position-absolute top-0 end-0" onClick={() => removeImage(i)} style={{ transform: 'translate(25%, -25%)' }}>X</Button>
              </Col>
            ))}
          </Row>

          <Form.Group className="mb-3">
            <Button as="label" htmlFor="file-upload" variant="outline-secondary">{t('add_image')}</Button>
            <input id="file-upload" type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </Form.Group>

          <Button type="submit" disabled={loading}>{loading ? <Spinner as="span" size="sm" /> : t('submit_comment')}</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

// --- Comment List Component ---
const CommentList = ({ comments }) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [imageToShow, setImageToShow] = useState('');

  const handleImageClick = (imageUrl) => {
    setImageToShow(imageUrl);
    setShowModal(true);
  };

  if (!comments || comments.length === 0) {
    return <p className="mt-4">{t('no_comments_yet')}</p>;
  }

  return (
    <div className="mt-4">
      <h4>{t('comments')}</h4>
      {comments.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(comment => (
        <Card key={comment._id} className="mb-3">
          <Card.Body>
            <p>{comment.content}</p>
            <Row>
              {comment.images.map((img, i) => (
                <Col key={i} xs={4} md={3} lg={2} className="mb-2">
                  <Image 
                    src={`${import.meta.env.VITE_API_BASE_URL}${img}`} 
                    thumbnail 
                    style={{ cursor: 'pointer', width: '100px', height: '100px', objectFit: 'cover' }} 
                    onClick={() => handleImageClick(img)} 
                  />
                </Col>
              ))}
            </Row>
            <small className="text-muted">{new Date(comment.createdAt).toLocaleString()}</small>
          </Card.Body>
        </Card>
      ))}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton />
        <Modal.Body className="text-center">
          <Image src={`${import.meta.env.VITE_API_BASE_URL}${imageToShow}`} fluid />
        </Modal.Body>
      </Modal>
    </div>
  );
};

// --- Main Comment Section Component ---
const CommentSection = ({ recipe, onCommentsUpdate }) => {
  return (
    <div className="mt-5">
      <CommentForm recipeId={recipe._id} onCommentPosted={onCommentsUpdate} />
      <CommentList comments={recipe.comments} />
    </div>
  );
};

export default CommentSection;
