const { Review } = require('../models');
const { fn, col } = require('sequelize');

async function getProductRatingStats(id_product) {
  const result = await Review.findOne({
    where: { id_product },
    attributes: [
      [fn('AVG', col('rating')), 'average'],
      [fn('COUNT', col('id_review')), 'total']
    ],
    raw: true
  });

  return {
    average: result?.average
      ? Number(parseFloat(result.average).toFixed(2))
      : 0,
    total: result?.total
      ? parseInt(result.total)
      : 0
  };
}

module.exports = {
  getProductRatingStats
};