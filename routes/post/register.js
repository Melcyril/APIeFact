// routes/register.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { registerLimiter } = require('../../middlewares/rateLimiter');
const { User } = require('../../models');
const { sendWelcomeEmail } = require('../../services/emailService');

const router = express.Router();

// Validation des champs
const validateRegister = [
  body('nom').notEmpty().withMessage('Nom requis'),
  body('prenom').notEmpty().withMessage('Prénom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('mot_de_passe')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
    .matches(/[^A-Za-z0-9]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial'),
  body('tel').optional().isMobilePhone().withMessage('Numéro de téléphone invalide'),
  //body('id_statut').notEmpty().withMessage('Statut requis')
];

router.post('/', registerLimiter, validateRegister, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nom, prenom, email, mot_de_passe, tel, id_statut } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const newUser = await User.create({
      nom,
      prenom,
      email,
      mot_de_passe: hashedPassword,
      tel,
      id_statut:3,
      date_inscription: new Date(),
      date_derniere_connexion: null
    });

    // 📧 Envoi de l'email de bienvenue
    try {
      await sendWelcomeEmail(email, prenom);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // Ne bloque pas la création de l'utilisateur si l'email échoue
    }

    res.status(201).json({
      id_user: newUser.id_user,
      message: 'Utilisateur créé avec succès.'
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
