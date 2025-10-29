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
    prix_achat: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    prixHT: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    remise: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    tva: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 20 // par ex. 20%
    },
    actif: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    id_category: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    prixTTC: {
      type: DataTypes.VIRTUAL,
      get() {
        const prixHT = parseFloat(this.prixHT) || 0;
        const tva = parseFloat(this.tva) || 0;
        return +(prixHT * (1 + tva / 100)).toFixed(2);
      }
    }
  }, {
    tableName: 'product',
    timestamps: false
  });

  Product.associate = (models) => {
    Product.hasMany(models.Cart_Item, { foreignKey: 'id_product', as: 'cartItems' });
  };

  return Product;
};
