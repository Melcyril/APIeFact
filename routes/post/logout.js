const express = require('express');

const router = express.Router();

router.post('/', async (req, res) => {

  try {

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    });

    return res.json({
      message: 'Déconnexion réussie'
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      message: 'Erreur interne du serveur.'
    });

  }

});

module.exports = router;