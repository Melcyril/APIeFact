module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
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
      allowNull: true
    },

    reference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    prix_achat: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    prixHT: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    prixTTC: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    remise: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },

    tva: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 20
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
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

  return Product;
};