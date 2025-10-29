import React, { useState } from 'react';
import { Container, Row, Col, Nav, Button, Offcanvas } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);

  const SidebarContent = ({ showTitle = true }) => (
    <Nav className="flex-column">
      {showTitle && (
        <Nav.Item className="mb-3">
          <h4>{t('admin_menu')}</h4>
        </Nav.Item>
      )}
      <LinkContainer to="/admin/users" onClick={handleClose}>
        <Nav.Link>{t('user_management')}</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/methods" onClick={handleClose}>
        <Nav.Link>{t('method_management')}</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/countries" onClick={handleClose}>
        <Nav.Link>{t('country_management')}</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/stores" onClick={handleClose}>
        <Nav.Link>{t('store_management')}</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/ingredients" onClick={handleClose}>
        <Nav.Link>{t('ingredient_management')}</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/recipes" onClick={handleClose}>
        <Nav.Link>{t('recipe_management')}</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/allergens" onClick={handleClose}>
        <Nav.Link>{t('allergen_management')}</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/special-groups" onClick={handleClose}>
        <Nav.Link>{t('special_group_management')}</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/reports" onClick={handleClose}>
        <Nav.Link>{t('report_management')}</Nav.Link>
      </LinkContainer>
      {/* Add other admin links here */}
    </Nav>
  );

  return (
    <Container fluid className="mt-4">
      {/* Offcanvas Toggle Button (Visible only on small screens) */}
      <div className="d-md-none mb-3">
        <Button variant="secondary" onClick={handleShow}>
          {t('admin_menu')}
        </Button>
      </div>

      <Row>
        {/* Sidebar (Visible only on medium screens and up) */}
        <Col md={3} lg={2} className="d-none d-md-block bg-light sidebar">
          <SidebarContent />
        </Col>

        {/* Main Content */}
        <Col md={9} lg={10}>
          <Outlet />
        </Col>
      </Row>

      {/* Offcanvas Sidebar for small screens */}
      <Offcanvas show={showOffcanvas} onHide={handleClose} responsive="md">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t('admin_menu')}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SidebarContent showTitle={false} />
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default AdminDashboard;
