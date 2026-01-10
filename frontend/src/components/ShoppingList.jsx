import React from 'react';
import { Container, ListGroup, Row, Col, Card, Image, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../utils/translationHelper';
import { FaStore } from 'react-icons/fa';

// This component is designed to be rendered inside a modal and captured by html2canvas.
const ShoppingList = React.forwardRef(({ items }, ref) => {
  const { t, i18n } = useTranslation();

  const totalCost = items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);

  const groupedByStore = items.reduce((acc, item) => {
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
    <div ref={ref} style={{ width: '210mm', padding: '15mm', backgroundColor: 'white' }}>
      <Container fluid>
        <h1 className="text-center mb-4">{t('shopping_list')}</h1>
        
        {Object.values(groupedByStore).map(({ storeInfo, items }) => (
          <Card key={storeInfo._id} className="mb-4">
            <Card.Header as="h5" className="d-flex align-items-center bg-light">
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
                    <Col xs={2}>
                      <Image
                        src={item.ingredientImage || 'https://via.placeholder.com/100'}
                        fluid
                        rounded
                        onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/100'; }}
                      />
                    </Col>
                    <Col xs={6}>
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
                    <Col xs={2} className="text-center">
                      <span>x {item.quantity}</span>
                    </Col>
                    <Col xs={2} className="text-end">
                      <strong>{(item.quantity * (item.price || 0)).toFixed(2)} &euro;</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        ))}

        <Card className="mt-4 bg-light">
          <Card.Body>
            <h4 className="text-end">{t('total_cost')}: {totalCost.toFixed(2)} &euro;</h4>
          </Card.Body>
        </Card>
        <div className="text-center text-muted mt-4" style={{ fontSize: '10px' }}>
            {new Date().toLocaleString()}
        </div>
      </Container>
    </div>
  );
});

export default ShoppingList;