module.exports = (sequelize, DataTypes) => {
    const Product_Image = sequelize.define('Product_Image', {
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
      }
    }, {
      tableName: 'product_image',
      timestamps: false
    });
  
    return Product_Image;
  };
  