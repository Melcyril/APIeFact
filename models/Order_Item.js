module.exports = (sequelize, DataTypes) => {
    const Order_Item = sequelize.define('Order_Item', {
      id_order_item: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_order: {
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
      },
      prixTTC: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    }, {
      tableName: 'order_item',
      timestamps: false,
    });
  
    return Order_Item;
  };
  