import React from 'react';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const AdminWelcome = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <Card.Body>
                <Card.Title as="h4">{t('admin_dashboard')}</Card.Title>
                <Card.Text>
                    {t('admin_welcome_message')}
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default AdminWelcome;
