import React from 'react';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
    const navigate = useNavigate();

    const redirectToDashboard = () => {
        navigate('/');
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={7}>
                    <Alert variant="danger">
                        <h1 className="mb-4 mt-4">Error occurred during displaying the Survey!</h1>
                        <p className="lead">You have already submitted this survey.</p>
                        <p>Please contact our support team if you have any further questions.</p>
                    </Alert>
                    <div className="text-center">
                        <Button variant="primary" onClick={() => redirectToDashboard()}>Back to Dashboard</Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ErrorPage;
