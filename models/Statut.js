// models/Statut.js
module.exports = (sequelize, DataTypes) => {
    const Statut = sequelize.define('Statut', {
      id_statut: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      tableName: 'statut',
      timestamps: false
    });
  
    return Statut;
  };
  