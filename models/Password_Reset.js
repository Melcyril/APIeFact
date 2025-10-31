module.exports = (sequelize, DataTypes) => {
    const Password_Reset = sequelize.define('Password_Reset', {
      id_token: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      token_unique: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      date_expiration: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }, {
      tableName: 'password_reset',
      timestamps: false,
    });
  
    return Password_Reset;
  };
  