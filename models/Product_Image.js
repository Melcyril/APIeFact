//Product_image.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Product_Image', {
    id_image: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_product: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_principale: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'product_image',
    timestamps: false
  });
};
