const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();
const db = mysql.createConnection(process.env.DB_URL);

// Middleware pour vérifier le token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Token manquant' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token invalide' });
    req.user = decoded;
    next();
  });
};

// Route pour mettre à jour le profil
router.put('/update', verifyToken, async (req, res) => {
  const { nom, prénom, email, tel } = req.body;
  const userId = req.user.id_user;

  try {
    // Mettre à jour l'utilisateur
    await db.promise().query('UPDATE user SET nom = ?, prénom = ?, email = ?, tel = ? WHERE id_user = ?', 
      [nom, prénom, email, tel, userId]
    );

    res.status(200).json({ message: 'Profil mis à jour' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
