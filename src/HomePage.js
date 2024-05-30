import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import axios from 'axios';

const HomePage = () => {
    const [surveys, setSurveys] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const response = await axios.get('/api/surveyWithQuestions');
                const data = await response.data;

                if (Array.isArray(data)) {
                    const sortedSurveys = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    setSurveys(sortedSurveys);
                } else if (typeof data === 'object') {
                    setSurveys([data]);
                } else {
                    console.error('Surveys data is not an array or object:', data);
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching surveys:', error);
                setIsLoading(false);
            }
        };

        fetchSurveys();
    }, []);

    const handleViewSurvey = (surveyId) => {
        navigate(`/FindSurvey/${surveyId}`);
    };

    const handleViewSurveyReport = (surveyId) => {
        navigate(`/SurveyReport/${surveyId}`);
    };

    return (
        <Container className="homepage-container">
            <h1 className="title">Available Surveys</h1>
            {isLoading ? (
                <div className="text-center loading-container">
                    <Spinner animation="border" role="status" className="loading-spinner">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="loading-text">Loading Surveys...</p>
                </div>
            ) : (
                <Row className="survey-list">
                    {surveys.map((survey) => (
                        <Col key={survey._id} xs={12} sm={6} md={4} lg={3}>
                            <Card className="survey-card">
                                <Card.Body>
                                    <Card.Title>{survey.title}</Card.Title>
                                    <Card.Text>{survey.description}</Card.Text>
                                    <div className="button-group">
                                        <Button variant="primary" onClick={() => handleViewSurvey(survey._id)}>
                                            View Survey
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleViewSurveyReport(survey._id)}>
                                            Survey Report
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default HomePage;
