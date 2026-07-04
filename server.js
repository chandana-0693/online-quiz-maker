const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'quizverse-super-secret-cryptographic-hash-key-2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
}

// ==========================================
// AUTHENTICATION API ROUTES
// ==========================================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required.' });
        }

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email.toLowerCase() },
                    { username: username }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or Email is already registered.' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Save User
        const user = await prisma.user.create({
            data: {
                username,
                email: email.toLowerCase(),
                passwordHash,
                xp: 0,
                level: 1
            }
        });

        // Generate JWT
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                xp: user.xp,
                level: user.level
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'An error occurred during registration.' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(400).json({ error: 'Invalid email address or password.' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                xp: user.xp,
                level: user.level
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'An error occurred during sign-in.' });
    }
});

// Get Profile Info
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) return res.status(404).json({ error: 'User not found.' });

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            xp: user.xp,
            level: user.level
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve profile data.' });
    }
});


// ==========================================
// QUIZZES API ROUTES
// ==========================================

// Get All Quizzes (with search and filters)
app.get('/api/quizzes', async (req, res) => {
    try {
        const { topic, difficulty, search } = req.query;

        // Build conditional queries
        const whereClause = {};

        if (topic && topic !== 'all') {
            whereClause.topic = { equals: topic };
        }

        if (difficulty && difficulty !== 'all') {
            whereClause.difficulty = { equals: difficulty };
        }

        if (search) {
            whereClause.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { authorName: { contains: search } }
            ];
        }

        const quizzes = await prisma.quiz.findMany({
            where: whereClause,
            include: {
                questions: {
                    select: { id: true } // Only select ID to get size
                }
            }
        });

        // Adapt payload to match what frontend expect
        const formatted = quizzes.map(q => ({
            id: q.id,
            title: q.title,
            description: q.description,
            topic: q.topic,
            difficulty: q.difficulty,
            duration: q.duration,
            author: q.authorName,
            authorId: q.authorId,
            questions: q.questions // matches frontend array length expectation
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Fetch Quizzes Error:', error);
        res.status(500).json({ error: 'Failed to retrieve quizzes.' });
    }
});

// Get Quiz Detail (Security: excludes correct answers and explanations)
app.get('/api/quizzes/:id', async (req, res) => {
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: req.params.id },
            include: {
                questions: {
                    select: {
                        id: true,
                        text: true,
                        options: true
                        // Exclude correctAnswer and explanation for security
                    }
                }
            }
        });

        if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

        const formatted = {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            topic: quiz.topic,
            difficulty: quiz.difficulty,
            duration: quiz.duration,
            author: quiz.authorName,
            authorId: quiz.authorId,
            questions: quiz.questions.map(q => ({
                id: q.id,
                text: q.text,
                options: JSON.parse(q.options) // parse options JSON string back to array
            }))
        };

        res.json(formatted);
    } catch (error) {
        console.error('Fetch Quiz Detail Error:', error);
        res.status(500).json({ error: 'Failed to retrieve quiz details.' });
    }
});

// Create Quiz
app.post('/api/quizzes', authenticateToken, async (req, res) => {
    try {
        const { title, description, topic, difficulty, duration, questions } = req.body;

        if (!title || !topic || !difficulty || !duration || !questions || !questions.length) {
            return res.status(400).json({ error: 'Title, Topic, Difficulty, Duration and Questions are required.' });
        }

        // 1. Create Quiz
        const createdQuiz = await prisma.quiz.create({
            data: {
                title,
                description,
                topic,
                difficulty,
                duration: parseInt(duration),
                authorId: req.user.id,
                authorName: req.user.username
            }
        });

        // 2. Create Questions
        for (const question of questions) {
            await prisma.question.create({
                data: {
                    quizId: createdQuiz.id,
                    text: question.text,
                    options: JSON.stringify(question.options), // save options as array string
                    correctAnswer: parseInt(question.correctAnswer),
                    explanation: question.explanation
                }
            });
        }

        // 3. Award Creator with 100 XP
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        let updatedUser = null;
        if (user) {
            const newXp = (user.xp || 0) + 100;
            const newLevel = Math.floor(newXp / 500) + 1;
            updatedUser = await prisma.user.update({
                where: { id: req.user.id },
                data: { xp: newXp, level: newLevel }
            });
        }

        res.status(201).json({
            success: true,
            quizId: createdQuiz.id,
            xpEarned: 100,
            user: updatedUser ? {
                id: updatedUser.id,
                username: updatedUser.username,
                xp: updatedUser.xp,
                level: updatedUser.level
            } : null
        });
    } catch (error) {
        console.error('Create Quiz Error:', error);
        res.status(500).json({ error: 'Failed to create quiz.' });
    }
});

// Delete Quiz
app.delete('/api/quizzes/:id', authenticateToken, async (req, res) => {
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: req.params.id }
        });

        if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

        // Ensure current user is the author
        if (quiz.authorId !== req.user.id) {
            return res.status(403).json({ error: 'You are not authorized to delete this quiz.' });
        }

        await prisma.quiz.delete({
            where: { id: req.params.id }
        });

        res.json({ success: true, message: 'Quiz deleted successfully.' });
    } catch (error) {
        console.error('Delete Quiz Error:', error);
        res.status(500).json({ error: 'Failed to delete quiz.' });
    }
});


// ==========================================
// ATTEMPTS & SCORE GRADING API ROUTES
// ==========================================

// Submit Quiz Attempt (Secure Grading on Server)
app.post('/api/quizzes/:id/attempt', authenticateToken, async (req, res) => {
    try {
        const { answersSelected, timeTaken } = req.body;
        const quizId = req.params.id;

        if (!answersSelected || !timeTaken) {
            return res.status(400).json({ error: 'Selected answers and time taken are required.' });
        }

        // Fetch quiz with full questions (correctAnswer included)
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true }
        });

        if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

        const questions = quiz.questions;
        let correctCount = 0;
        const reviews = [];

        // Grade each question
        questions.forEach((q, idx) => {
            const userAnswerIdx = answersSelected[idx];
            const isCorrect = userAnswerIdx === q.correctAnswer;
            
            if (isCorrect) correctCount++;

            reviews.push({
                text: q.text,
                options: JSON.parse(q.options),
                correctAnswer: q.correctAnswer,
                userAnswer: userAnswerIdx,
                explanation: q.explanation
            });
        });

        const totalQuestions = questions.length;
        const accuracy = Math.round((correctCount / totalQuestions) * 100);

        // XP Calculation: 20 XP per correct question + 50 XP bonus for 100%
        let xpGain = correctCount * 20;
        if (correctCount === totalQuestions) xpGain += 50;

        // 1. Log Attempt in DB
        const attempt = await prisma.attempt.create({
            data: {
                userId: req.user.id,
                quizId: quiz.id,
                quizTitle: quiz.title,
                topic: quiz.topic,
                score: correctCount,
                totalQuestions: totalQuestions,
                timeTaken: timeTaken
            }
        });

        // 2. Update User XP & Level in DB
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        let updatedUser = null;
        if (user) {
            const newXp = (user.xp || 0) + xpGain;
            const newLevel = Math.floor(newXp / 500) + 1;
            updatedUser = await prisma.user.update({
                where: { id: req.user.id },
                data: { xp: newXp, level: newLevel }
            });
        }

        res.json({
            correctCount,
            totalQuestions,
            accuracy,
            xpGain,
            timeTaken,
            reviews,
            user: updatedUser ? {
                id: updatedUser.id,
                username: updatedUser.username,
                xp: updatedUser.xp,
                level: updatedUser.level
            } : null
        });

    } catch (error) {
        console.error('Quiz Attempt Grading Error:', error);
        res.status(500).json({ error: 'An error occurred while grading the quiz.' });
    }
});


// ==========================================
// USER DASHBOARD STATISTICS API ROUTE
// ==========================================

// Get Stats and History Lists
app.get('/api/users/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch User Info
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) return res.status(404).json({ error: 'User not found.' });

        // Fetch Attempts
        const attempts = await prisma.attempt.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });

        // Fetch Created Quizzes
        const createdQuizzes = await prisma.quiz.findMany({
            where: { authorId: userId },
            include: {
                questions: {
                    select: { id: true }
                }
            }
        });

        // Calculate Average Accuracy
        let avgAccuracy = 0;
        if (attempts.length > 0) {
            const sumAccuracy = attempts.reduce((acc, att) => {
                return acc + ((att.score / att.totalQuestions) * 100);
            }, 0);
            avgAccuracy = Math.round(sumAccuracy / attempts.length);
        }

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                xp: user.xp,
                level: user.level
            },
            attempts: attempts.map(att => ({
                id: att.id,
                quizTitle: att.quizTitle,
                topic: att.topic,
                score: att.score,
                totalQuestions: att.totalQuestions,
                timeTaken: att.timeTaken,
                date: att.date
            })),
            createdQuizzes: createdQuizzes.map(q => ({
                id: q.id,
                title: q.title,
                topic: q.topic,
                difficulty: q.difficulty,
                questionsCount: q.questions.length
            })),
            stats: {
                takenCount: attempts.length,
                createdCount: createdQuizzes.length,
                avgAccuracy,
                totalXp: user.xp
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: 'Failed to retrieve stats.' });
    }
});


// Catch-all route to serve the SPA frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Boot Server
app.listen(PORT, () => {
    console.log(`🚀 QuizVerse server started at http://localhost:${PORT}`);
});
