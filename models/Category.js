module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
      id_category: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ordre: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      actif: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      }
    }, {
      tableName: 'category',
      timestamps: false,
    });
  
    // Association auto-référentielle pour la hiérarchie
    Category.hasMany(Category, { as: 'subcategories', foreignKey: 'parent_id' });
    Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });
  
    return Category;
  };
  