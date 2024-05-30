import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Survey } from 'survey-react-ui';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import 'survey-core/modern.fontless.min.css';

const FindSurvey = () => {
    const isLoggedIn = document.cookie.includes('isAuthenticated=true');
    const { surveyId } = useParams('surveyId');
    const [surveyData, setSurveyData] = useState(null);
    const [completeText, setCompleteText] = useState('Error');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
        window.email = localStorage.getItem('email');
        fetchSurveyFromMongoDB();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [surveyId]);

    const checkresponse = async () => {
        try {
            const id = surveyId;
            const response = await axios.post('/api/checkresponse', {
                responseData: {
                    email: window.email,
                    id: id,
                },
            });
            if (response.status === 200) {
                return true; // Response OK, return true
            } else {
                return false; // Response not OK, return false or handle the error case appropriately
            }
        } catch (error) {
            console.error(error);
            navigate('/error');
            return false; // Error occurred, return false or handle the error case appropriately
        }
    };


    const fetchSurveyFromMongoDB = async () => {
        try {
            const status = await checkresponse();
            if (status === true) {
                const response = await axios.get(`/api/surveyWithQuestions/${surveyId}`);
                const surveyDataFromMongoDB = response.data;
                const formattedSurveyData = formatSurveyData(surveyDataFromMongoDB);
                setSurveyData(formattedSurveyData);
            }
        } catch (error) {
            console.error('Error fetching survey data:', error);
        }
    };

    const formatSurveyData = (surveyDataFromMongoDB) => {
        console.log('Survey data from MongoDB:', surveyDataFromMongoDB);

        if (!surveyDataFromMongoDB || !surveyDataFromMongoDB.questions) {
            return null; // Return null or handle the error case appropriately
        }

        const formattedData = {
            title: surveyDataFromMongoDB.title,
            description: surveyDataFromMongoDB.description,
            completeHtml: completeText,
            pages: [
                {
                    name: 'page1',
                    elements: surveyDataFromMongoDB.questions.map((question) => {
                        const { _id, question: questionText, options, type: questionType } = question;

                        if (!_id || !questionText || !options || !Array.isArray(options)) {
                            return null; // Skip this question or handle the error case appropriately
                        }

                        const choices = options
                            .filter((option) => option)
                            .map((option) => option);

                        if (!choices.length) {
                            return null; // Skip this question or handle the error case appropriately
                        }

                        return {
                            type: questionType,
                            name: `question${_id}`,
                            title: questionText,
                            choices,
                            showChoicesOrder: 'random',
                        };
                    }).filter((question) => question !== null), // Filter out null values
                },
            ],
        };

        console.log('Formatted survey data:', formattedData);

        return formattedData;
    };

    const saveSurvey = async (survey) => {
        try {
            const id = surveyId;
            const questions = surveyData.pages[0].elements;
            const response = await axios.post('/api/submitSurvey', {
                surveyId: surveyData.id,
                responseData: {
                    email: window.email,
                    id: id,
                    questions: questions.map((question) => {
                        const questionId = question.name.replace('question', '');
                        const questionText = question.title;
                        const answer = survey.data[question.name];

                        return {
                            questionId: questionId,
                            questionText: questionText,
                            answer: [answer], // Store the answer as an array
                        };
                    }),
                },
            });

            console.log('Survey data saved successfully:', response.data);
            navigate('/'); // Redirect to another page after completing the survey
        } catch (error) {
            console.error('Error submitting survey data:', error);
            setCompleteText('Error submitting the survey. Please try again.');
            navigate('/error');
        }
    };

    return (
        <Container style={{ marginTop: '-10px', marginBottom: '-80px' }}>
            <div>
                {surveyData ? (
                    <Survey json={surveyData} onComplete={saveSurvey} />
                ) : (
                    <div className='text-center' style={{ marginTop: '200px' }}>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <p className="mt-3">Loading Survey. Please wait...</p>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default FindSurvey;