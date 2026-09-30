const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');

const router = express.Router();

router.post('/', async (req, res) => {

  const refreshToken =
    req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: 'Refresh token manquant'
    });
  }

  try {

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findByPk(
      decoded.id_user
    );

    if (!user) {
      return res.status(401).json({
        message: 'Utilisateur introuvable'
      });
    }

    const newAccessToken = jwt.sign(
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

    return res.json({
      token: newAccessToken
    });

  } catch (err) {

    console.error(
      'Erreur refresh token:',
      err
    );

    return res.status(403).json({
      message:
        'Refresh token invalide ou expiré'
    });

  }

});

module.exports = router;