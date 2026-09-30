const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { loginLimiter } = require('../../middlewares/rateLimiter');
const { User } = require('../../models');

const router = express.Router();

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email invalide'),

  body('mot_de_passe')
    .notEmpty()
    .withMessage('Mot de passe requis'),
];

router.post(
  '/',
  loginLimiter,
  validateLogin,
  async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { email, mot_de_passe } = req.body;

    try {

      // =========================
      // RECHERCHE UTILISATEUR
      // =========================

      const user = await User.findOne({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          message: 'Email ou mot de passe incorrect.'
        });
      }

      // =========================
      // VÉRIFICATION MOT DE PASSE
      // =========================

      const isMatch = await bcrypt.compare(
        mot_de_passe,
        user.mot_de_passe
      );

      if (!isMatch) {
        return res.status(401).json({
          message: 'Email ou mot de passe incorrect.'
        });
      }

      // =========================
      // DERNIÈRE CONNEXION
      // =========================

      await user.update({
        date_derniere_connexion: new Date()
      });

      // =========================
      // ACCESS TOKEN
      // =========================

      const token = jwt.sign(
        {
          id_user: user.id_user,
          nom: user.nom,
          id_statut: user.id_statut
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '40min'
        }
      );

      // =========================
      // REFRESH TOKEN
      // =========================

      const refreshToken = jwt.sign(
        {
          id_user: user.id_user
        },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: '7d'
        }
      );

      // =========================
      // COOKIE HTTPONLY
      // =========================

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,

        secure:
          process.env.NODE_ENV === 'production',

        sameSite: 'Strict',

        maxAge:
          7 * 24 * 60 * 60 * 1000
      });

      // =========================
      // USER POUR ANGULAR
      // =========================

      const userResponse = {
        id_user: user.id_user,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        id_statut: user.id_statut
      };

      // =========================
      // RÉPONSE
      // =========================

      return res.json({
        message: 'Connexion réussie',
        token,
        user: userResponse
      });

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        message: 'Erreur interne du serveur.'
      });

    }

  }
);

module.exports = router;