const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

const bcrypt = require('bcrypt');
const saltRounds = 10;

// Configurer la connexion MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Remplacez par votre nom d'utilisateur MySQL
    password: '', // Remplacez par votre mot de passe MySQL
    database: 'userdb' // Remplacez par le nom de votre base de données
});

// Connecter à MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('MySQL Connected...');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Attempting login with:', username, password); // Log des informations de login

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).send('Internal server error');
            return;
        }
        console.log('Query results:', results); // Log des résultats de la requête

        if (results.length > 0) {
            const user = results[0];
            // Comparer le mot de passe avec le mot de passe haché stocké en base de données
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    res.status(500).send('Internal server error');
                    return;
                }
                if (isMatch) {
                    res.send('Login successful!');
                } else {
                    res.send('Incorrect username or password.');
                }
            });
        } else {
            res.send('Incorrect username or password.');
        }
    });
});

app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    console.log('Attempting signup with:', username, email, password); // Log des informations de signup

    // Hacher le mot de passe avant de le stocker en base de données
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).send('Internal server error');
            return;
        }

        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hash], (err, result) => {
            if (err) {
                console.error('Database query error:', err);
                res.status(500).send('Internal server error');
                return;
            }
            res.json({ success: true });
        });
    });
});

app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, 'welcome.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

