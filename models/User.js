// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_statut: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    mot_de_passe: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tel: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // 🔹 Champs manquants
    date_inscription: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    date_derniere_connexion: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'user',
    timestamps: false
  });

  return User;
};
