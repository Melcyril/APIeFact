module.exports = (sequelize, DataTypes) => {
    const Favorite = sequelize.define('Favorite', {
      id_favorite: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_product: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
      tableName: 'favorite',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['id_user', 'id_product'], // Empêche les doublons
        },
      ],
    });
  
    return Favorite;
  };
  