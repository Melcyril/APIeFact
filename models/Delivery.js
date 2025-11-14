// Delivery.js
module.exports = (sequelize, DataTypes) => {
    const Delivery = sequelize.define('Delivery', {
      id_delivery: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      frais: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    }, {
      tableName: 'delivery',
      timestamps: false,
    });
  
    return Delivery;
  };
  