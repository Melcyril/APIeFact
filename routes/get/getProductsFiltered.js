const express = require('express');
const { Op } = require('sequelize');
const { Product, Category, Product_Image } = require('../../models');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { 
      categoryId,   // Filtrer par catégorie
      search,       // Rechercher par nom ou marque
      sort = 'nom', // Champ de tri par défaut
      order = 'asc', // Ordre du tri ('asc' ou 'desc')
      page = 1,      // Page actuelle
      limit = 10     // Nombre d’éléments par page
    } = req.query;

    // Champs autorisés pour le tri
    const sortableFields = ['nom', 'prixHT', 'prix_achat', 'tva', 'createdAt'];
    if (!sortableFields.includes(sort)) {
      return res.status(400).json({ message: `Tri non autorisé: ${sort}` });
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Construction du WHERE dynamique
    const whereClause = {};

    if (categoryId) {
      whereClause.id_category = categoryId;
    }

    if (search) {
      whereClause[Op.or] = [
        { nom: { [Op.like]: `%${search}%` } },
        { marque: { [Op.like]: `%${search}%` } }
      ];
    }

    // Requête principale avec includes
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category', attributes: ['id_category', 'nom'] },
        { model: Product_Image, as: 'images', attributes: ['image_url', 'is_principale'] }
      ],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Réponse structurée
    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      totalProducts: count,
      totalPages: Math.ceil(count / limit),
      products
    });
  } catch (error) {
    console.error('❌ Erreur récupération produits filtrés :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;

/* GET 

/api/productsFiltered?search=iphone

/api/productsFiltered?categoryId=3&sort=prixHT&order=desc

/api/productsFiltered?search=samsung&page=2&limit=5

/api/productsFiltered?sort=nom&order=asc

/api/productsFiltered?categoryId=2&search=iphone&sort=prixHT&order=desc&page=1&limit=10
*/