const express = require('express');
const crypto = require('crypto');
const { User, Password_Reset } = require('../../models');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Génération du token
    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 3600000); // 1h

    await Password_Reset.create({
      id_user: user.id_user,
      token_unique: token,
      date_expiration: expiration
    });

    // TODO: envoyer un mail (ici on simule)
    console.log(`🔗 Lien de réinitialisation : http://localhost:3000/reset-password/${token}`);

    res.json({ message: 'Lien de réinitialisation envoyé par email (simulé).' });
  } catch (error) {
    console.error('Erreur envoi lien reset:', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;
