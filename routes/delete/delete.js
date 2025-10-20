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

// Route pour supprimer le profil
router.delete('/delete', verifyToken, async (req, res) => {
  const userId = req.user.id_user;

  try {
    // Supprimer l'utilisateur de la base de données
    await db.promise().query('DELETE FROM user WHERE id_user = ?', [userId]);

    res.status(200).json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
