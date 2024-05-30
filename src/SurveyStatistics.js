// SurveyStatistics.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import './SurveyStatistics.css';
import axios from 'axios';

const SurveyStatistics = () => {
    const { surveyId } = useParams();
    const [statistics, setStatistics] = useState([]);
    const [totalResponses, setTotalResponses] = useState([]);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await axios.get(`/api/surveys/${surveyId}/statistics`, {
                    responseData: {
                        id: surveyId,
                    },
                });
                const { totalResponses, formattedStatistics } = response.data;
                setTotalResponses(totalResponses);
                setStatistics(formattedStatistics);
            } catch (error) {
                console.error('Error fetching survey statistics:', error);
            }
        };

        fetchStatistics();
    }, [surveyId]);

    const mergeRatiosByQuestion = (statistics) => {
        const mergedStatistics = [];
        const mergedQuestions = {};

        statistics.forEach(({ questionText, ratios }) => {
            if (!mergedQuestions[questionText]) {
                mergedQuestions[questionText] = [];
            }

            ratios.forEach(({ answer, ratio }) => {
                mergedQuestions[questionText].push({ answer, ratio });
            });
        });

        for (const questionText in mergedQuestions) {
            mergedStatistics.push({ questionText, ratios: mergedQuestions[questionText] });
        }

        return mergedStatistics;
    };

    const mergedStatistics = mergeRatiosByQuestion(statistics);

    return (
        <Container className="survey-statistics-container mt-9" style={{ marginTop: '80px' }}>
            <Row className="justify-content-center">
                <Col md={8}>
                    <h2 className="text-center mb-4">Survey Analytics</h2>
                    <h5 className="text-left mb-2">Survey ID: {surveyId}</h5>
                    <h5 className="text-left mb-2">Total Responses: {totalResponses}</h5>
                    {mergedStatistics.length > 0 ? (
                        <div className="survey-statistics">
                            {mergedStatistics.map(({ questionText, ratios }) => (
                                <Card key={questionText} className="survey-question-card">
                                    <Card.Body>
                                        <Card.Title>{questionText}</Card.Title>
                                        {ratios.map(({ answer, ratio }, index) => (
                                            <div key={index} className="answer-item">
                                                <div className="answer-label">
                                                    <span className="answer-text">{answer}</span>
                                                </div>

                                                <div className="answer-progress">
                                                    <div className="progress-bar-container">
                                                        <ProgressBar now={ratio * 100} label={`${(ratio * 100).toFixed(2)}%`} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center">No statistics available.</p>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default SurveyStatistics;
