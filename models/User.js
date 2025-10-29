//User.js
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('User', {
      id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      id_statut: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      tableName: 'user',
      timestamps: false
    });
  };
  