const express = require('express');
const { Op } = require('sequelize');
const { Product, Category, Product_Image } = require('../../models');

const router = express.Router();

// GET /api/product/search?nom=chaise&marque=Sony&category=Mobilier
router.get('/', async (req, res) => {
  try {
    const { nom, marque, category } = req.query;

    // Conditions sur Product
    const whereClause = {};
    if (nom) whereClause.nom = { [Op.like]: `%${nom}%` };
    if (marque) whereClause.marque = { [Op.like]: `%${marque}%` };

    // Include Category et Product_Image
    const includeClause = [
      {
        model: Product_Image,
        as: 'images',
        required: false
      }
    ];

    if (category) {
      includeClause.push({
        model: Category,
        as: 'category',
        where: { nom: { [Op.like]: `%${category}%` } },
        required: true
      });
    } else {
      includeClause.push({
        model: Category,
        as: 'category',
        required: false
      });
    }

    const products = await Product.findAll({
      where: whereClause,
      include: includeClause
    });

    res.json({ results: products });
  } catch (error) {
    console.error('Erreur recherche produit :', error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
});

module.exports = router;
