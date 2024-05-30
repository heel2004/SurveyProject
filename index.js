const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./User');
const { MongoClient } = require('mongodb');

const app = express();
app.use(bodyParser.json());
const corsOptions = {
    origin: 'https://techinsights.netlify.app/' // Replace with your frontend URL
};

// Add a middleware to set the CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://techinsights.netlify.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, FETCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// MongoDB Atlas connection string
const uri = 'mongodb+srv://havaghani0q:x6KGFbGTOTEh1yTg@surveydb.vsut8gh.mongodb.net/surveyCollection?retryWrites=true&w=majority';

// Connect to MongoDB Atlas
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
    });

app.get('/api/demo', async (req, res) => {
    try {
        res.status(200).json("surveyData");
    } catch (error) {
        console.error('Error fetching survey data:', error);
        res.status(500).json({ error: 'An error occurred while fetching survey data' });
    }
});

// Routes
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ email, password });
        await user.save();

        res.status(200).json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
});

// Create a schema for the survey data
const surveySchema = new mongoose.Schema({
    devices: [String],
    operatingSystem: String,
    technologyUsage: String,
    noteTakingApps: [String],
    internetConnectivity: Number,
    onlineLearningPlatforms: String,
});

// Create a model based on the survey schema
const Survey = mongoose.model('Survey', surveySchema);

// Create a schema for the survey data with questions and options
const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
    },
});

const surveyWithQuestionsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    questions: {
        type: [questionSchema],
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    }
});

// Create a model based on the survey schema with questions and options
const SurveyWithQuestions = mongoose.model('SurveyWithQuestions', surveyWithQuestionsSchema);

// Define an API endpoint to handle saving survey data with questions
app.post('/api/surveyWithQuestions', (req, res) => {
    const surveyData = req.body;
    const newSurvey = new SurveyWithQuestions(surveyData);

    newSurvey.save()
        .then(() => {
            console.log('Survey data with questions saved successfully');
            res.status(200).json({ message: 'Survey data with questions saved successfully' });
        })
        .catch((error) => {
            console.error('Error saving survey data with questions:', error);
            res.status(500).json({ error: 'An error occurred while saving survey data with questions' });
        });
});

// Define an API endpoint to handle saving survey data without questions
app.post('/api/surveyCollection', (req, res) => {
    const surveyData = req.body;
    const newSurvey = new Survey(surveyData);

    newSurvey.save()
        .then(() => {
            console.log('Survey data saved successfully');
            res.status(200).json({ message: 'Survey data saved successfully' });
        })
        .catch((error) => {
            console.error('Error saving survey data:', error);
            res.status(500).json({ error: 'An error occurred while saving survey data' });
        });
});

// Define the survey response schema
const surveyResponseSchema = new mongoose.Schema({
    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
    responseData: {
        email: String,
        id: String,
        questions: [
            {
                questionId: String,
                questionText: String,
                answer: mongoose.Schema.Types.Mixed,
            },
        ],
    },
    useremail: String,
});

// Create the survey response model
const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

// API route to handle survey response submissions
app.post('/api/submitSurvey', async (req, res) => {
    try {
        const { surveyId, responseData } = req.body;

        // Create a new survey response document
        const surveyResponse = new SurveyResponse({
            surveyId,
            responseData
        });

        // Save the survey response to the database
        await surveyResponse.save();
        const email = responseData.email;
        const questions = responseData.questions;
        const htmlResponse = generateHTML(responseData, questions);
        sendEmail(email, 'Thank you for finishing the survey', htmlResponse);
        res.status(200).json({ message: 'Survey response saved successfully' });
    } catch (error) {
        console.error('An error occurred while saving survey response:', error);
        res.status(500).json({ error: 'Failed to save survey response' });
    }
});

const generateHTML = (response, questions) => {
    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Survey Response</title>
          <!-- Bootstrap styles -->
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
            rel="stylesheet"
          />
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
            }
  
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              background-color: #ffffff;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
  
            h1 {
              color: #333;
              margin-top: 0;
              margin-bottom: 20px;
              text-align: left;
            }
  
            .survey-info {
              margin-bottom: 30px;
            }
  
            .survey-info p {
              margin-bottom: 5px;
            }
  
            .question {
              margin-bottom: 30px;
            }
  
            .question strong {
              color: #333;
              display: block;
              margin-bottom: 10px;
              font-size: 18px;
            }
  
            .choices {
              list-style-type: none;
              padding: 0;
              margin: 0;
            }
  
            .choices li {
              margin-bottom: 15px;
              display: flex;
              align-items: left;
            }
  
            .choice-label {
              flex: 1;
            }
  
            .choice-input {
              margin-right: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Survey Response</h1>
            <div class="survey-info">
              <p><strong>Email:</strong> ${response.email}</p>
              <p><strong>Survey ID:</strong> ${response.id}</p>
            </div>
    `;

    try {
        response.questions.forEach((questionResponse) => {
            const questionId = questionResponse.questionId.toString(); // Convert ObjectId to String
            const question = questions.find((q) => q.questionId === questionId); // Compare as strings

            if (question) {
                html += `
            <div class="question">
              <strong>${question.questionText}:</strong>
              <ul class="choices">
                ${Array.isArray(questionResponse.answer)
                        ? questionResponse.answer
                            .map(
                                (choice) => `
                  <li>
                    <label class="choice-label">
                      <input type="checkbox" class="choice-input" disabled />
                      ${choice}
                    </label>
                  </li>
                `
                            )
                            .join('')
                        : `
                  <li>
                    <label class="choice-label">
                      <input type="radio" class="choice-input" disabled />
                      ${questionResponse.answer}
                    </label>
                  </li>
                `}
              </ul>
            </div>
          `;
            } else {
                throw new Error(`Question not found for ID: ${questionId}`);
            }
        });
    } catch (error) {
        throw error;
    }

    html += `
          </div>
          <!-- Bootstrap scripts -->
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
      </html>
    `;

    return html;
};


app.post('/api/checkresponse', async (req, res) => {
    try {
        const { responseData } = req.body;

        // Extract the values of the fields you want to check from the responseData object
        const { id, email } = responseData;

        // Check if any response record already exists with the same field1 and field2 values
        const existingResponse = await SurveyResponse.findOne({
            'responseData.id': id,
            'responseData.email': email,
        }).exec();

        if (existingResponse) {
            // User has already submitted the survey
            console.log('You have already submitted this survey');
            return res.status(400).json({ error: 'You have already submitted this survey' });
        }

        // Send a success response with data (e.g., an empty object)
        return res.status(200).json({});

    } catch (error) {
        console.error('An error occurred while saving survey response:', error);
        res.status(500).json({ error: 'Failed to save survey response' });
    }
});

app.get('/api/surveyWithQuestions', async (req, res) => {
    try {
        const surveyData = await SurveyWithQuestions.find({}).exec();
        res.status(200).json(surveyData);
    } catch (error) {
        console.error('Error fetching survey data:', error);
        res.status(500).json({ error: 'An error occurred while fetching survey data' });
    }
});

app.get('/api/surveyWithQuestions/:id', async (req, res) => {
    try {
        const surveyId = req.params.id;
        const surveyData = await SurveyWithQuestions.findById(surveyId).exec();
        if (!surveyData) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        res.status(200).json(surveyData);
    } catch (error) {
        console.error('Error fetching survey data:', error);
        res.status(500).json({ error: 'An error occurred while fetching survey data' });
    }
});

app.get('/api/surveys/:surveyId/statistics', async (req, res) => {
    const { surveyId } = req.params;

    try {
        const responses = await SurveyResponse.find({ 'responseData.id': surveyId, }).exec();
        const statistics = calculateStatistics(responses);
        res.json(statistics);
    } catch (error) {
        console.error('Error fetching survey statistics:', error);
        res.status(500).json({ error: 'An error occurred while fetching survey statistics' });
    }
});

function calculateStatistics(responses) {
    const questionRatios = {};
    let totalResponses = 0;

    responses.forEach((response) => {
        const { questions } = response.responseData;

        questions.forEach((question) => {
            const { questionText, answer } = question;
            if (!questionRatios[questionText]) {
                questionRatios[questionText] = {};
            }
            if (!questionRatios[questionText][answer]) {
                questionRatios[questionText][answer] = 0;
            }
            questionRatios[questionText][answer]++;
        });

        totalResponses++;
    });

    const formattedStatistics = Object.entries(questionRatios).map(([questionText, answers]) => {
        const ratios = Object.entries(answers).map(([answer, count]) => ({
            answer,
            ratio: count / totalResponses,
        }));

        return {
            questionText,
            ratios,
        };
    });

    return {
        totalResponses,
        formattedStatistics,
    };
}

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const nodemailer = require("nodemailer");

// Create a transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "havaghani0q@gmail.com",
        pass: "ivgtiudbikgcxyzo",
    },
});

// Create a function to send the email
async function sendEmail(to, subject, surveyResponse) {
    try {
        // Send the email
        const info = await transporter.sendMail({
            from: "Heel Vaghani",
            to: to,
            subject: subject,
            html: `${surveyResponse}`
        });

        console.log("Email sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}
