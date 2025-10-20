const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/', (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token manquant' });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Refresh token invalide ou expiré' });
    }

    // Création d'un nouveau access token
    const newAccessToken = jwt.sign(
      { id_user: decoded.id_user },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // (Optionnel) Tu peux aussi faire une rotation de refresh token ici si tu veux
    // const newRefreshToken = jwt.sign(
    //   { id_user: decoded.id_user },
    //   process.env.JWT_REFRESH_SECRET,
    //   { expiresIn: '7d' }
    // );
    // res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 7*24*60*60*1000 });

    res.json({ token: newAccessToken });
  });
});

module.exports = router;
