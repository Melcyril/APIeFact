module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Product', {
      id_product: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      marque: {
        type: DataTypes.STRING,
        allowNull: false
      },
      reference: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      prix_achat: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
      },
      prixHT: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
      },
      remise: {
        type: DataTypes.DECIMAL(5,2),
        defaultValue: 0.00
      },
      tva: {
        type: DataTypes.DECIMAL(5,2),
        defaultValue: 20.00
      },
      actif: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      id_category: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      tableName: 'product',
      timestamps: false
    });
  };
  