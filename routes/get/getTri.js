const express = require('express');
const { Product, Category, Product_Image } = require('../../models');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { sort = 'nom', order = 'asc' } = req.query; // valeurs par défaut

    // On valide les champs de tri
    const sortableFields = ['nom', 'prixHT', 'createdAt'];
    if (!sortableFields.includes(sort)) {
      return res.status(400).json({ message: `Tri non autorisé: ${sort}` });
    }

    const products = await Product.findAll({
      include: [
        { model: Category, as: 'category', attributes: ['nom'] },
        { model: Product_Image, as: 'images', attributes: ['image_url'] }
      ],
      order: [[sort, order.toUpperCase()]] // Sequelize veut ASC ou DESC
    });

    res.json({ products });
  } catch (error) {
    console.error('Erreur récupération produits triés :', error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
});

module.exports = router;
