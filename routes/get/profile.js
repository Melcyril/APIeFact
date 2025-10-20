const express = require('express');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
    res.json({ message: 'Profil de l\'utilisateur', user: req.user });
});

module.exports = router;
