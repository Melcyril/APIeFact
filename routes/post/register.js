const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');
const {registerLimiter} = require('../../middlewares/rateLimiter');
dotenv.config();

const router = express.Router();

// Connexion à la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// 🧼 Middleware de validation
const validateRegister = [
    body('nom').notEmpty().withMessage('Nom requis'),
    body('prenom').notEmpty().withMessage('Prénom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('mot_de_passe').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('tel').optional().isMobilePhone().withMessage('Numéro de téléphone invalide')
];
// Route pour l'enregistrement d'un nouvel utilisateur
router.post('/',registerLimiter,validateRegister, (req, res) => {  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { nom, prenom, email, mot_de_passe, id_statut } = req.body;

    if (!nom || !prenom || !email || !mot_de_passe || !id_statut) {
        return res.status(400).json({ message: 'Nom, prénom, email, mot de passe et statut sont requis.' });
    }

    // Vérification si l'email existe déjà
    db.execute('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Erreur lors de la recherche de l\'email:', err); // Log de l'erreur
            return res.status(500).json({ message: 'Erreur interne du serveur lors de la recherche de l\'email.' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        // Hachage du mot de passe avant de l'enregistrer
        bcrypt.hash(mot_de_passe, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Erreur lors du hachage du mot de passe:', err);  // Log de l'erreur
                return res.status(500).json({ message: 'Erreur lors du hachage du mot de passe.' });
            }

            // Enregistrement de l'utilisateur dans la base de données
            db.execute('INSERT INTO user (nom, prenom, email, mot_de_passe, id_statut) VALUES (?, ?, ?, ?, ?)', 
                [nom, prenom, email, hashedPassword, id_statut], 
                (err, results) => {
                    if (err) {
                        console.error('Erreur lors de l\'insertion de l\'utilisateur:', err);  // Log de l'erreur
                        return res.status(500).json({ message: 'Erreur lors de l\'enregistrement de l\'utilisateur.' });
                    }

                    console.log('Utilisateur enregistré avec succès:', results); // Log de la réussite
                    res.status(201).json({ message: 'Utilisateur créé avec succès.' });
                });
        });
    });
});

module.exports = router;
