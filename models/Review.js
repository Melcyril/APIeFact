module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id_review: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    id_product: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    id_order: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    rating: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }

  }, {
    tableName: 'review',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Review;
};