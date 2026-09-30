const express = require('express');
const crypto = require('crypto');
const { User, Password_Reset } = require('../../models');
const { sendPasswordResetEmail } = require('../../services/emailService');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Génération du token
    const token = crypto.randomBytes(32).toString('hex');
    console.log("🔑 Token généré :", token); // <-- affichage du token dans la console à effacer plus tard
    const expiration = new Date(Date.now() + 3600000); // 1h

    // Enregistrement du token en base
    await Password_Reset.create({
      id_user: user.id_user,
      token_unique: token,
      date_expiration: expiration
    });

    // Envoi du mail réel
    try {
      await sendPasswordResetEmail(email, token);
      console.log(`🔗 Lien de réinitialisation envoyé à ${email}`);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      return res.status(500).json({ message: 'Impossible d\'envoyer l\'email de réinitialisation.' });
    }

    res.json({ message: 'Lien de réinitialisation envoyé par email.' });
  } catch (error) {
    console.error('Erreur envoi lien reset:', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;
