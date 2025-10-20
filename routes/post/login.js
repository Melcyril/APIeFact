const express = require('express');
const bcrypt = require('bcryptjs');
// jsonwebtoken Génère un token pour les routes sécurisées
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');

// 🔐 Rate limiter protège contre les attaques bruteforce
const {loginLimiter} = require('../../middlewares/rateLimiter');

dotenv.config();

const router = express.Router();

// Connexion à la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// 🛡️ Validation des entrées
const validateLogin = [
    body('email').isEmail().withMessage('Email invalide'),
    body('mot_de_passe').notEmpty().withMessage('Mot de passe requis')
];

// Route pour la connexion utilisateur
router.post('/', loginLimiter, validateLogin, (req, res) => {

    //Valide que l’email est bien formé, etc.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
        return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
    }

    db.execute('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const user = results[0];

        bcrypt.compare(mot_de_passe, user.mot_de_passe, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la comparaison du mot de passe.' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
            }
            
            const token = jwt.sign(
                { id_user: user.id_user, nom: user.nom },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ message: 'Connexion réussie', token });
        });
    });
});

module.exports = router;
