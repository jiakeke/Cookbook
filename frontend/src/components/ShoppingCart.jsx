import React, { useContext, useState, useRef } from 'react';
import { Container, ListGroup, Button, Row, Col, Card, Image, ButtonGroup, Modal, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../context/CartContext';
import { getLocalizedValue } from '../utils/translationHelper';
import { FaTrash, FaStore } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ShoppingList from './ShoppingList';

const ShoppingCart = () => {
  const { cartItems, addToCart, decreaseQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const { t, i18n } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const listRef = useRef();

  const handleGeneratePdf = () => {
    setIsGenerating(true);
    const input = listRef.current;

    html2canvas(input, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Important for external images
      logging: false,
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const imgWidth = pdfWidth - 20; // With some margin
      const imgHeight = imgWidth / ratio;
      
      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save('shopping-list.pdf');
      setIsGenerating(false);
      setShowModal(false);
    }).catch(err => {
        console.error("Error generating PDF", err);
        setIsGenerating(false);
        alert("Sorry, there was an error generating the PDF.");
    });
  };

  const totalCost = cartItems.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);

  const groupedByStore = cartItems.reduce((acc, item) => {
    const storeId = item.store._id;
    if (!acc[storeId]) {
      acc[storeId] = {
        storeInfo: item.store,
        items: []
      };
    }
    acc[storeId].items.push(item);
    return acc;
  }, {});

  return (
    <>
      <Container className="my-4">
        <h1 className="mb-4">{t('shopping_cart')}</h1>
        {cartItems.length === 0 ? (
          <Card className="text-center">
            <Card.Body>
              <Card.Title>{t('cart_is_empty')}</Card.Title>
              <Card.Text>{t('go_to_recipes_to_add')}</Card.Text>
              <Button as={Link} to="/recipes" variant="primary">{t('browse_recipes')}</Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            {Object.values(groupedByStore).map(({ storeInfo, items }) => (
              <Card key={storeInfo._id} className="mb-4">
                <Card.Header as="h5" className="d-flex align-items-center">
                  {storeInfo.logo ? (
                    <Image
                      src={storeInfo.logo}
                      style={{ height: '30px', width: 'auto', maxWidth: '100px', marginRight: '15px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <FaStore size={24} className="me-3" />
                  )}
                  {getLocalizedValue(storeInfo.name, i18n.language)}
                </Card.Header>
                <ListGroup variant="flush">
                  {items.map(item => (
                    <ListGroup.Item key={item.cartItemId}>
                      <Row className="align-items-center">
                        <Col xs={3} sm={2}>
                          <Image
                            src={item.ingredientImage || 'https://via.placeholder.com/100'}
                            fluid
                            rounded
                            onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/100'; }}
                          />
                        </Col>
                        <Col xs={9} sm={4} md={3}>
                          <h6>{getLocalizedValue(item.ingredientName, i18n.language)}</h6>
                          {item.recipes && item.recipes.length > 0 && (
                            <div className="mt-1">
                              {item.recipes.map(recipe => (
                                <div key={recipe.id} className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  <Badge bg="info" className="me-1">{t('source_recipe')}</Badge>
                                  {getLocalizedValue(recipe.name, i18n.language)}
                                </div>
                              ))}
                            </div>
                          )}
                          <span className="text-muted small d-block mt-1">{t('size_spec')}: {item.size}</span>
                        </Col>
                        <Col xs={12} sm={6} md={4} className="d-flex align-items-center justify-content-start justify-content-sm-center mt-2 mt-sm-0">
                          <ButtonGroup>
                            <Button size="sm" variant="outline-secondary" onClick={() => decreaseQuantity(item.cartItemId)}>-</Button>
                            <Button variant="light" disabled style={{ minWidth: '40px' }}>{item.quantity}</Button>
                            <Button size="sm" variant="outline-secondary" onClick={() => addToCart(item)}>+</Button>
                          </ButtonGroup>
                          <span className="ms-3 text-muted">x {(item.price || 0).toFixed(2)} &euro;</span>
                        </Col>
                        <Col xs={12} sm={12} md={3} className="text-end mt-2 mt-md-0">
                          <strong className="me-3">{(item.quantity * (item.price || 0)).toFixed(2)} &euro;</strong>
                          <Button variant="danger" size="sm" onClick={() => removeFromCart(item.cartItemId)}>
                            <FaTrash />
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            ))}

            <Card className="mt-4">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={6}>
                    <h4>{t('total_cost')}: {totalCost.toFixed(2)} &euro;</h4>
                  </Col>
                  <Col md={6} className="text-md-end">
                    <Button variant="success" onClick={() => setShowModal(true)} className="me-2 mb-2 mb-md-0">
                      {t('generate_shopping_list')}
                    </Button>
                    <Button variant="warning" onClick={clearCart}>
                      {t('clear_cart')}
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </>
        )}
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('shopping_list_preview')}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ position: 'relative' }}>
          {isGenerating && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}>
              <Spinner animation="border" role="status" className="mb-3">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <span>{t('generating_pdf')}</span>
            </div>
          )}
          <div style={{ overflowX: 'auto' }}>
            <ShoppingList items={cartItems} ref={listRef} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleGeneratePdf} disabled={isGenerating}>
            {t('download_pdf')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ShoppingCart;
