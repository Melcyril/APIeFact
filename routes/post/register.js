const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { registerLimiter } = require('../../middlewares/rateLimiter');
const { User } = require('../../models');  // Importe ton modèle User
const router = express.Router();

const validateRegister = [
  body('nom').notEmpty().withMessage('Nom requis'),
  body('prenom').notEmpty().withMessage('Prénom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('mot_de_passe').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('tel').optional().isMobilePhone().withMessage('Numéro de téléphone invalide'),
  body('id_statut').notEmpty().withMessage('Statut requis')
];

router.post('/', registerLimiter, validateRegister, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nom, prenom, email, mot_de_passe, tel, id_statut } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // Création de l'utilisateur
    await User.create({
      nom,
      prenom,
      email,
      mot_de_passe: hashedPassword,
      tel,
      id_statut
    });

    res.status(201).json({ message: 'Utilisateur créé avec succès.' });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
