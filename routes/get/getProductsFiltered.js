const express = require('express');
const { Op } = require('sequelize');
const {
  Product,
  Category,
  Product_Image
} = require('../../models');

const router = express.Router();

const EPSILON = 0.001;

// =========================
// CALCUL PRIX FINAL TTC
// =========================
function getFinalPrice(product) {

  const ht = Number(product.prixHT) || 0;
  const tva = Number(product.tva) || 0;

  let remise = Number(product.remise) || 0;

  // remise en % ou ratio
  if (remise > 1) {
    remise = remise / 100;
  }

  if (remise < 0) {
    remise = 0;
  }

  if (remise > 1) {
    remise = 1;
  }

  return ht * (1 + tva / 100) * (1 - remise);
}

// ======================================================
// RÉCUPÉRER TOUS LES ENFANTS D'UNE CATÉGORIE
// ======================================================
async function getCategoryAndChildren(categoryId) {

  const categories = await Category.findAll({
    attributes: [
      'id_category',
      'nom',
      'parent_id'
    ],
    raw: true
  });

  const selectedId = Number(categoryId);

  const ids = [selectedId];

  let parentsToSearch = [selectedId];

  while (parentsToSearch.length > 0) {

    const children = categories.filter(category =>
      parentsToSearch.includes(Number(category.parent_id))
    );

    const newIds = children
      .map(category => Number(category.id_category))
      .filter(id => !ids.includes(id));

    ids.push(...newIds);

    parentsToSearch = newIds;
  }

  return ids;
}

// =========================
// ROUTE GET PRODUCTS
// =========================
router.get('/', async (req, res) => {

  try {

    const {
      categoryId,
      search,
      sort = 'prixFinal',
      order = 'asc',
      page = 1,
      limit = 50,
      minPrice,
      maxPrice
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    console.log('\n🚀 GET PRODUCTS FILTERED');
    console.log('📥 QUERY:', req.query);

    // ==================================================
    // CATÉGORIE + SOUS-CATÉGORIES
    // ==================================================

    let categoryIds = [];

    if (categoryId) {

      categoryIds = await getCategoryAndChildren(categoryId);

      console.log(
        '📂 CATEGORY IDS:',
        categoryIds
      );
    }

    // =========================
    // WHERE SQL
    // =========================

    const whereClause = {

      ...(categoryIds.length > 0 && {
        id_category: {
          [Op.in]: categoryIds
        }
      }),

      ...(search && {
        [Op.or]: [
          {
            nom: {
              [Op.like]: `%${search}%`
            }
          },
          {
            marque: {
              [Op.like]: `%${search}%`
            }
          }
        ]
      })
    };

    // =========================
    // FETCH DB
    // =========================

    const productsRaw = await Product.findAll({

      where: whereClause,

      include: [

        {
          model: Category,
          as: 'category',
          attributes: [
            'id_category',
            'nom',
            'parent_id'
          ]
        },

        {
          model: Product_Image,
          as: 'images',
          attributes: [
            'image_url',
            'is_principale'
          ]
        }

      ]
    });

    console.log(
      '📦 RAW COUNT:',
      productsRaw.length
    );

    // ==================================================
    // MAP + PRIX FINAL
    // ==================================================

    let products = productsRaw.map(p => {

      const product = p.toJSON();

      product.prixHT =
        Number(product.prixHT) || 0;

      product.prix_achat =
        Number(product.prix_achat) || 0;

      product.tva =
        Number(product.tva) || 0;

      product.remise =
        Number(product.remise) || 0;

      const prixFinal =
        getFinalPrice(product);

      const mainImage =
        product.images?.find(
          i => i.is_principale
        );

      return {

        ...product,

        prixFinal,

        prixTTC: prixFinal,

        prixTTCAffiche:
          +prixFinal.toFixed(2),

        main_image_url:
          mainImage?.image_url || null
      };

    });

    // =========================
    // SLIDER MIN / MAX
    // =========================

    const allPrices =
      products.map(p => p.prixFinal);

    const minVal =
      allPrices.length
        ? Math.min(...allPrices)
        : 0;

    const maxVal =
      allPrices.length
        ? Math.max(...allPrices)
        : 0;

    // =========================
    // FILTRE PRIX MIN
    // =========================

    if (
      minPrice !== undefined &&
      minPrice !== ''
    ) {

      const min =
        Number(minPrice);

      products =
        products.filter(
          p =>
            p.prixFinal >=
            min - EPSILON
        );
    }

    // =========================
    // FILTRE PRIX MAX
    // =========================

    if (
      maxPrice !== undefined &&
      maxPrice !== ''
    ) {

      const max =
        Number(maxPrice);

      products =
        products.filter(
          p =>
            p.prixFinal <=
            max + EPSILON
        );
    }

    console.log(
      '📊 AFTER FILTER:',
      products.length
    );

    // =========================
    // TRI
    // =========================

    if (
      sort === 'prixFinal' ||
      sort === 'prixHT'
    ) {

      products.sort((a, b) =>
        order === 'asc'
          ? a.prixFinal - b.prixFinal
          : b.prixFinal - a.prixFinal
      );

    } else {

      products.sort((a, b) =>
        order === 'asc'
          ? (a[sort] > b[sort] ? 1 : -1)
          : (a[sort] < b[sort] ? 1 : -1)
      );

    }

    // =========================
    // PAGINATION
    // =========================

    const totalProducts =
      products.length;

    const totalPages =
      Math.ceil(
        totalProducts / limitNum
      );

    const offset =
      (pageNum - 1) * limitNum;

    const paginated =
      products.slice(
        offset,
        offset + limitNum
      );

    // =========================
    // RESPONSE
    // =========================

    return res.json({

      page: pageNum,

      limit: limitNum,

      totalProducts,

      totalPages,

      minPrice:
        Math.floor(minVal),

      maxPrice:
        Math.ceil(maxVal),

      selectedCategoryId:
        categoryId
          ? Number(categoryId)
          : null,

      categoryIds,

      products:
        paginated

    });

  } catch (error) {

    console.error(
      '❌ ERROR:',
      error
    );

    return res.status(500).json({

      message:
        'Erreur serveur'

    });

  }

});

module.exports = router;