import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { token, updateUser } = useAuth();

  // State for profile form
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    gender: '',
    height: '',
    weight: '',
    allergens: [],
    specialGroups: [],
  });
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // State for options
  const [allAllergens, setAllAllergens] = useState([]);
  const [allSpecialGroups, setAllSpecialGroups] = useState([]);

  // State for password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const fetchProfileAndOptions = async () => {
      setLoading(true);
      try {
        const [profileRes, allergensRes, specialGroupsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/allergens`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/special-groups`)
        ]);

        const { name, birthday, gender, height, weight, allergens, specialGroups } = profileRes.data;
        setFormData({
          name: name || '',
          birthday: birthday ? new Date(birthday).toISOString().split('T')[0] : '',
          gender: gender || '',
          height: height || '',
          weight: weight || '',
          allergens: allergens?.map(a => typeof a === 'object' ? a._id : a) || [],
          specialGroups: specialGroups?.map(sg => typeof sg === 'object' ? sg._id : sg) || [],
        });

        setAllAllergens(allergensRes.data);
        setAllSpecialGroups(specialGroupsRes.data);

      } catch (err) {
        setProfileError(t('fetch_profile_failed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfileAndOptions();
    }
  }, [token, t]);

  const onProfileChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onPasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleCheckboxChange = (e, type) => {
    const { value, checked } = e.target;
    setFormData(prevState => {
      const currentSelection = prevState[type];
      if (checked) {
        return { ...prevState, [type]: [...currentSelection, value] };
      } else {
        return { ...prevState, [type]: currentSelection.filter(item => item !== value) };
      }
    });
  };

  const onProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    if (!formData.name.trim()) {
      setProfileError(t('name_is_required'));
      return;
    }
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, formData);
      updateUser(res.data);
      setProfileSuccess(t('update_profile_success'));
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || t('update_profile_failed');
      setProfileError(errorMsg);
      console.error(err);
    }
  };

  const onPasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('passwords_do_not_match'));
      return;
    }
    if (passwordData.newPassword.length < 8) {
        setPasswordError(t('password_too_short'));
        return;
    }
    try {
      const payload = { 
        currentPassword: passwordData.currentPassword, 
        newPassword: passwordData.newPassword 
      };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/change-password`, payload);
      setPasswordSuccess(t('update_password_success'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.msg || t('update_password_failed');
      setPasswordError(errorMsg);
      console.error(err);
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          {/* Profile Form Card */}
          <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Card.Body>
              <h3 className="text-center mb-4">{t('user_profile')}</h3>
              {profileError && <Alert variant="danger">{profileError}</Alert>}
              {profileSuccess && <Alert variant="success">{profileSuccess}</Alert>}
              <Form noValidate onSubmit={onProfileSubmit}>
                {/* Profile fields... */}
                <Form.Group className="mb-3" controlId="formName"><Form.Label>{t('name')}</Form.Label><Form.Control type="text" placeholder={t('enter_name')} name="name" value={formData.name} onChange={onProfileChange} required /></Form.Group>
                <Form.Group className="mb-3" controlId="formBirthday"><Form.Label>{t('birthday')}</Form.Label><Form.Control type="date" name="birthday" value={formData.birthday} onChange={onProfileChange} /></Form.Group>
                <Form.Group className="mb-3" controlId="formGender"><Form.Label>{t('gender')}</Form.Label><Form.Control as="select" name="gender" value={formData.gender} onChange={onProfileChange}><option value="">{t('select_gender')}</option><option value="male">{t('male')}</option><option value="female">{t('female')}</option><option value="other">{t('other')}</option></Form.Control></Form.Group>
                <Row><Col md={6}><Form.Group className="mb-3" controlId="formHeight"><Form.Label>{t('height_cm')}</Form.Label><Form.Control type="number" placeholder="e.g., 175" name="height" value={formData.height} onChange={onProfileChange} /></Form.Group></Col><Col md={6}><Form.Group className="mb-3" controlId="formWeight"><Form.Label>{t('weight_kg')}</Form.Label><Form.Control type="number" placeholder="e.g., 70" name="weight" value={formData.weight} onChange={onProfileChange} /></Form.Group></Col></Row>
                
                <Form.Group className="mb-3" controlId="formAllergens">
                  <Form.Label>{t('allergens')}</Form.Label>
                  <div>
                    {allAllergens.map(allergen => (
                      <Form.Check
                        type="checkbox"
                        id={`profile-allergen-${allergen._id}`}
                        key={allergen._id}
                        label={allergen.name[i18n.language] || allergen.name.en}
                        value={allergen._id}
                        checked={formData.allergens.includes(allergen._id)}
                        onChange={(e) => handleCheckboxChange(e, 'allergens')}
                        inline
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formSpecialGroups">
                  <Form.Label>{t('special_groups')}</Form.Label>
                  <div>
                    {allSpecialGroups.map(group => (
                      <Form.Check
                        type="checkbox"
                        id={`profile-group-${group._id}`}
                        key={group._id}
                        label={group.name[i18n.language] || group.name.en}
                        value={group._id}
                        checked={formData.specialGroups.includes(group._id)}
                        onChange={(e) => handleCheckboxChange(e, 'specialGroups')}
                        inline
                      />
                    ))}
                  </div>
                </Form.Group>

                <div className="d-grid mt-3"><Button variant="primary" type="submit">{t('update_profile')}</Button></div>
              </Form>
            </Card.Body>
          </Card>

          {/* Change Password Card */}
          <Card style={{ maxWidth: '600px', margin: '40px auto 0 auto' }}>
            <Card.Body>
              <h3 className="text-center mb-4">{t('change_password')}</h3>
              {passwordError && <Alert variant="danger">{passwordError}</Alert>}
              {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}
              <Form onSubmit={onPasswordSubmit}>
                <Form.Group className="mb-3" controlId="currentPassword"><Form.Label>{t('current_password')}</Form.Label><Form.Control type="password" name="currentPassword" value={passwordData.currentPassword} onChange={onPasswordChange} required /></Form.Group>
                <Form.Group className="mb-3" controlId="newPassword"><Form.Label>{t('new_password')}</Form.Label><Form.Control type="password" name="newPassword" value={passwordData.newPassword} onChange={onPasswordChange} required /></Form.Group>
                <Form.Group className="mb-3" controlId="confirmPassword"><Form.Label>{t('confirm_new_password')}</Form.Label><Form.Control type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={onPasswordChange} required /></Form.Group>
                <div className="d-grid mt-3"><Button variant="warning" type="submit">{t('change_password')}</Button></div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
