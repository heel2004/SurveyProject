import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import 'survey-core/modern.fontless.min.css';

const SurveyForm = () => {

    const [surveyData, setSurveyData] = useState(null);

    useEffect(() => {

        const surveyJson = {
            "title": "A Comprehensive Survey on Student Technology Usage and Preferences",
            "description": "Your opinion matters to us!",
            "pages": [
                {
                    "elements": [
                        {
                            "type": "checkbox",
                            "name": "devices",
                            "title": "1. What types of devices do you use for studying and school-related tasks? (Select all that apply)",
                            "choices": [
                                "Laptop",
                                "Desktop computer",
                                "Tablet",
                                "Smartphone",
                                "Other (please specify)"
                            ]
                        },
                        {
                            "type": "radiogroup",
                            "name": "operatingSystem",
                            "title": "2. Which operating system(s) do you primarily use on your devices?",
                            "choices": [
                                "Windows",
                                "macOS",
                                "Linux",
                                "iOS",
                                "Android",
                                "Other (please specify)"
                            ]
                        },
                        {
                            "type": "radiogroup",
                            "name": "technologyUsage",
                            "title": "3. How often do you use technology for educational purposes outside of school hours?",
                            "choices": [
                                "Never",
                                "Rarely",
                                "Occasionally",
                                "Frequently",
                                "Always"
                            ]
                        },
                        {
                            "type": "checkbox",
                            "name": "noteTakingApps",
                            "title": "4. What are your preferred software or apps for note-taking and organizing your study materials? (Select all that apply)",
                            "choices": [
                                "Microsoft OneNote",
                                "Evernote",
                                "Google Keep",
                                "Notion",
                                "Apple Notes",
                                "Other (please specify)",
                                "I don't use any specific software or apps"
                            ]
                        },
                        {
                            "type": "rating",
                            "name": "internetConnectivity",
                            "title": "5. How important is access to reliable internet connectivity for your academic success?",
                            "minRateDescription": "Not important",
                            "maxRateDescription": "Extremely important"
                        },
                        {
                            "type": "comment",
                            "name": "onlineLearningPlatforms",
                            "title": "6. Have you used online learning platforms or educational apps? If yes, please list the platforms or apps you have used."
                        }
                    ]
                }
            ],
            "showProgressBar": "top",
            "progressBarType": "questions",
            "widthMode": "static",
            "width": "864px"
        };

        const survey = new Model(surveyJson);
        setSurveyData(survey);
    }, []);

    useEffect(() => {
        const sendSurveyDataToMongoDB = async () => {
            try {
                await axios.post('/api/surveyCollection', surveyData.data);
                console.log('Survey data saved successfully');
                // Success message or handle response accordingly
            } catch (error) {
                alert('An error occurred while saving survey data');
                console.error(error); // Handle any errors
            }
        };

        if (surveyData) {
            surveyData.onComplete.add(sendSurveyDataToMongoDB);
        }
    }, [surveyData]); // eslint-disable-next-line

    if (surveyData) {
        return <Container style={{ marginTop: '-10px', marginBottom: '-80px' }}>
            <Survey model={surveyData} /></Container>;
    }

    return <Container style={{ marginTop: '60px' }}><div>Loading survey...</div></Container>;
};

export default SurveyForm;