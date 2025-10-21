import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const languages = {
    en: { nativeName: 'English' },
    fi: { nativeName: 'Suomi' },
    zh: { nativeName: '中文' },
  };

  const currentLanguageName = languages[i18n.resolvedLanguage]?.nativeName || 'Language';

  return (
    <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>{t('welcome_message')}</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <LinkContainer to="/">
              <Nav.Link>{t('home')}</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/recipes">
              <Nav.Link>{t('recipes')}</Nav.Link>
            </LinkContainer>

            {user ? (
              <NavDropdown title={user.name} id="basic-nav-dropdown">
                <LinkContainer to="/profile">
                  <NavDropdown.Item>{t('profile')}</NavDropdown.Item>
                </LinkContainer>
                {user.role === 'admin' && (
                  <>
                    <NavDropdown.Divider />
                    <LinkContainer to="/admin">
                      <NavDropdown.Item>{t('admin')}</NavDropdown.Item>
                    </LinkContainer>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  {t('logout')}
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>{t('login')}</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>{t('register')}</Nav.Link>
                </LinkContainer>
              </>
            )}

            <NavDropdown title={currentLanguageName} id="language-nav-dropdown">
              {Object.keys(languages).map((lng) => (
                <NavDropdown.Item key={lng} onClick={() => changeLanguage(lng)} disabled={i18n.resolvedLanguage === lng}>
                  {languages[lng].nativeName}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
