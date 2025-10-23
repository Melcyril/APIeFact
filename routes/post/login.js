const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { loginLimiter } = require('../../middlewares/rateLimiter');
const { User } = require('../../models');  // <- Import Sequelize model
const router = express.Router();

const validateLogin = [
  body('email').isEmail().withMessage('Email invalide'),
  body('mot_de_passe').notEmpty().withMessage('Mot de passe requis'),
];

router.post('/', loginLimiter, validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, mot_de_passe } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

    const token = jwt.sign(
      { id_user: user.id_user, nom: user.nom, id_statut: user.id_statut },
      process.env.JWT_SECRET,
      { expiresIn: '15min' }
    );
    // Génère le refresh token (7 jours)
    const refreshToken = jwt.sign(
        { id_user: user.id_user },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
      
    // 🍪 Envoie le refresh token en cookie sécurisé
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true en prod HTTPS
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });
    
    res.json({ message: 'Connexion réussie', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
