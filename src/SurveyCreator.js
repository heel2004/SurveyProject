import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './SurveyCreator.css';

const SurveyCreator = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const navigate = useNavigate();

    const handleQuestionChange = (index, event) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].question = event.target.value;
        setQuestions(updatedQuestions);
    };

    const handleOptionChange = (questionIndex, optionIndex, event) => {

        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options[optionIndex] = event.target.value;
        setQuestions(updatedQuestions);
        if (questions[questionIndex].type === 'rating') {
            return;
        }
    };

    const handleTypeChange = (questionIndex, event) => {
        const updatedQuestions = [...questions];
        const selectedType = event.target.value;
        updatedQuestions[questionIndex].type = selectedType;

        updatedQuestions[questionIndex].options = [];

        if (selectedType === 'rating') {
            updatedQuestions[questionIndex].options = ['1', '2', '3', '4', '5'];
        }

        setQuestions(updatedQuestions);
    };


    const addQuestion = () => {
        setQuestions([...questions, { question: '', type: '', options: [] }]);
    };

    const addOption = (questionIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options.push('');
        setQuestions(updatedQuestions);
    };

    const removeQuestion = (questionIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions.splice(questionIndex, 1);
        setQuestions(updatedQuestions);
    };

    const removeOption = (questionIndex, optionIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options.splice(optionIndex, 1);
        setQuestions(updatedQuestions);
    };

    const saveSurvey = async () => {
        const surveyData = {
            title,
            description,
            questions: questions.map(({ question, type, options }) => ({ question, type, options })),
            timestamp: new Date(),
        };

        try {
            await axios.post('/api/surveyWithQuestions', surveyData);
            console.log(surveyData);
            console.log('Survey data saved successfully');
            // Success message or handle response accordingly
            navigate(`/`);
        } catch (error) {
            alert('An error occurred while saving survey data');
            console.error(error); // Handle any errors
        }
    };

    return (
        <Container className="survey-creator-container">
            <h3 style={{ marginBottom: '20px' }}>Create Survey</h3>
            <Form>
                <Form.Group controlId="surveyTitle">
                    <Form.Label>Survey Title:</Form.Label>
                    <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </Form.Group>

                <Form.Group controlId="surveyDescription">
                    <Form.Label>Survey Description:</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>

                <div className="survey-creator__questions">
                    <h3 style={{ marginTop: '20px' }}>Questions:</h3>
                    {questions.map((question, questionIndex) => (
                        <div key={questionIndex} className="survey-creator__question">
                            <Form.Group controlId={`question${questionIndex}`}>
                                <Form.Label>Question {questionIndex + 1}:</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={question.question}
                                    onChange={(e) => handleQuestionChange(questionIndex, e)}
                                />
                            </Form.Group>

                            <Form.Group controlId={`type${questionIndex}`} style={{ marginTop: '10px' }}>
                                <Form.Label>Question Type:</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={question.type}
                                    onChange={(e) => handleTypeChange(questionIndex, e)}
                                >
                                    <option value="">Select Type</option>
                                    <option value="radiogroup">Single Choice</option>
                                    <option value="checkbox">Multiple Choice</option>
                                    <option value="dropdown">Dropdown</option>
                                    <option value="rating">Rating</option>
                                </Form.Control>
                            </Form.Group>

                            {question.type === 'rating' ? (
                                <Form.Group controlId={`ratingOptions${questionIndex}`} style={{ marginTop: '10px' }}>
                                    <Form.Label>Rating Options:</Form.Label>
                                </Form.Group>
                            ) : (
                                <Form.Group controlId={`ratingOptions${questionIndex}`}>

                                </Form.Group>
                            )}

                            <ul className="survey-creator__options" style={{ marginTop: '10px', marginBottom: '20px' }}>
                                {question.options.map((option, optionIndex) => (
                                    <li key={optionIndex} className="survey-creator__option">
                                        <Form.Control
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, e)}
                                        />
                                        <Button
                                            onClick={() => removeOption(questionIndex, optionIndex)}
                                            variant="danger"
                                            className="survey-creator__remove-option"
                                            style={{ marginTop: '10px', marginBottom: '10px' }}
                                        >
                                            Remove Option
                                        </Button>
                                    </li>
                                ))}
                            </ul>

                            <div className="survey-creator__question-buttons">
                                <Button
                                    onClick={() => addOption(questionIndex)}
                                    className="survey-creator__add-option"
                                    style={{ marginBottom: '10px' }}
                                >
                                    Add Option
                                </Button>

                                <Button
                                    onClick={() => removeQuestion(questionIndex)}
                                    className="survey-creator__remove-question"
                                    style={{ marginLeft: '60px', marginBottom: '18px' }}
                                >
                                    Remove Question
                                </Button>

                            </div>
                        </div>
                    ))}
                </div>
                <div className="survey-creator__buttons">
                    <Button onClick={addQuestion} className="survey-creator__add-question" style={{ marginTop: '10px' }}>
                        Add Question
                    </Button>
                    <Button onClick={saveSurvey} className="survey-creator__save-survey" style={{ marginTop: '10px', marginLeft: '45px' }}>
                        Save Survey
                    </Button>
                </div>
            </Form>
        </Container >
    );
};

export default SurveyCreator;
