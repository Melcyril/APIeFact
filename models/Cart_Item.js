//Cart_Item.js
module.exports = (sequelize, DataTypes) => {
    const Cart_Item = sequelize.define('Cart_Item', {
      id_cart_item: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_cart: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_product: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantite: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    }, {
      tableName: 'cart_item',
      timestamps: false,
    });
  
    return Cart_Item;
  };
  