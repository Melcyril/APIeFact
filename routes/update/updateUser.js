const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

router.put('/:id', authenticateToken, authorizeRoles(2, 3), async (req, res) => {
  try {
    const userId = req.params.id;

    // Si abonné, il ne peut modifier que son propre compte
    if (req.user.id_statut === 2 && req.user.id_user.toString() !== userId) {
      return res.status(403).json({ message: "Vous ne pouvez pas modifier un autre utilisateur." });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Extraire les champs modifiables depuis le body (sécurité : n'autorise que certains champs)
    const { nom, prenom, email, tel, mot_de_passe } = req.body;

    // Préparer l'objet de mise à jour
    const updatedFields = {};

    if (nom) updatedFields.nom = nom;
    if (prenom) updatedFields.prenom = prenom;
    if (email) updatedFields.email = email;
    if (tel) updatedFields.tel = tel;

    // Si mot de passe fourni, on le hash avant de mettre à jour
    if (mot_de_passe) {
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
      updatedFields.mot_de_passe = hashedPassword;
    }

    // Mise à jour
    await user.update(updatedFields);

    res.json({ message: 'Profil mis à jour avec succès.' });
  } catch (error) {
    console.error('Erreur updateUser:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
