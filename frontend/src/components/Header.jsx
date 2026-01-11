import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar, Nav, NavDropdown, Container, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaRegHeart } from 'react-icons/fa';
import { CartContext } from '../context/CartContext.jsx';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext);

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
          <Nav className="ms-auto align-items-center">
            <LinkContainer to="/">
              <Nav.Link>{t('home')}</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/recipes">
              <Nav.Link>{t('recipes')}</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/ingredients">
              <Nav.Link>{t('ingredients')}</Nav.Link>
            </LinkContainer>

            {user ? (
              <>
                <LinkContainer to="/my-recipes">
                  <Nav.Link title={t('my_recipes')}>
                    <FaRegHeart size={20} />
                  </Nav.Link>
                </LinkContainer>
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
              </>
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

            <NavDropdown title={currentLanguageName} id="language-nav-dropdown" className="ms-2">
              {Object.keys(languages).map((lng) => (
                <NavDropdown.Item key={lng} onClick={() => changeLanguage(lng)} disabled={i18n.resolvedLanguage === lng}>
                  {languages[lng].nativeName}
                </NavDropdown.Item>
              ))}
            </NavDropdown>

            <LinkContainer to="/cart" className="ms-2">
              <Nav.Link>
                <FaShoppingCart />
                {cartItems.length > 0 && (
                  <Badge pill bg="success" style={{ marginLeft: '5px' }}>
                    {cartItems.reduce((qty, item) => qty + item.quantity, 0)}
                  </Badge>
                )}
              </Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
