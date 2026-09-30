const express = require('express');
const { Product } = require('../../models');

const router = express.Router();

// =========================
// CALCUL PRIX FINAL (ALIGNÉ AVEC productsFiltered)
// =========================
function getFinalPrice(product) {

  let prixHT = Number(product.prixHT);
  let remise = Number(product.remise);
  let tva = Number(product.tva);

  if (isNaN(prixHT) || prixHT < 0) prixHT = 0;
  if (isNaN(remise)) remise = 0;
  if (isNaN(tva)) tva = 0;

  // remise % -> ratio
  if (remise > 1) remise = remise / 100;
  if (remise < 0) remise = 0;
  if (remise > 0.95) remise = 0.95;

  const htAfter = prixHT * (1 - remise);
  const ttc = htAfter * (1 + tva / 100);

  // 🔥 arrondi propre (IMPORTANT)
  return Number(ttc.toFixed(2));
}

// =========================
// ROUTE PRICE RANGE
// =========================
router.get('/', async (req, res) => {

  try {

    console.log('🚀 GET PRICE RANGE REQUEST');

    const productsRaw = await Product.findAll({
      attributes: ['id_product', 'prixHT', 'remise', 'tva'] // 🔥 IMPORTANT
    });

    console.log('📦 TOTAL PRODUCTS:', productsRaw.length);

    const prices = productsRaw.map((p) => {

      const product = p.toJSON();
      const finalPrice = getFinalPrice(product);

      console.log(
        `ID:${product.id_product} HT:${product.prixHT} TVA:${product.tva} REM:${product.remise} FINAL:${finalPrice}`
      );

      return finalPrice;
    });

    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;

    console.log('🎚 MIN:', min, 'MAX:', max);

    return res.json({
      minPrice: Number(min.toFixed(2)),
      maxPrice: Number(max.toFixed(2))
    });

  } catch (error) {

    console.error('❌ PRICE RANGE ERROR:', error);

    return res.status(500).json({
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;