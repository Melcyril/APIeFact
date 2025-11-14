module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id_order: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_payment_method: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_delivery: {
      type: DataTypes.INTEGER,
      allowNull: true, // peut être null si la livraison n'est pas encore assignée
    },
    nom_livraison: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    prenom_livraison: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    adresse_livraison: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ville: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code_postal: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    date_commande: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    statut_commande: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'en cours',
    },
  }, {
    tableName: 'order',
    timestamps: false,
  });

  return Order;
};
