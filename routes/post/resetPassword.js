const express = require('express');
const bcrypt = require('bcrypt');
const { User, Password_Reset } = require('../../models');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { token, nouveau_mot_de_passe } = req.body;
    if (!token || !nouveau_mot_de_passe) {
      return res.status(400).json({ message: 'Token et nouveau mot de passe requis.' });
    }

    // Validation du mot de passe (même regex que register.js)
    const regexMajuscule = /[A-Z]/;
    const regexCaractereSpecial = /[^A-Za-z0-9]/;

    if (
      nouveau_mot_de_passe.length < 6 ||
      !regexMajuscule.test(nouveau_mot_de_passe) ||
      !regexCaractereSpecial.test(nouveau_mot_de_passe)
    ) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 6 caractères, une majuscule et un caractère spécial.'
      });
    }

    const resetEntry = await Password_Reset.findOne({ where: { token_unique: token } });
    if (!resetEntry) return res.status(404).json({ message: 'Token invalide ou expiré.' });

    if (new Date() > new Date(resetEntry.date_expiration)) {
      await resetEntry.destroy();
      return res.status(400).json({ message: 'Token expiré.' });
    }

    const user = await User.findByPk(resetEntry.id_user);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const hash = await bcrypt.hash(nouveau_mot_de_passe, 10);
    user.mot_de_passe = hash;
    await user.save();

    await resetEntry.destroy();

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    console.error('Erreur reset password :', error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
});

module.exports = router;
