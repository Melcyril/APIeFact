module.exports = (sequelize, DataTypes) => {
    const Payment_Method = sequelize.define('Payment_Method', {
      id_payment_method: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      actif: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    }, {
      tableName: 'payment_method',
      timestamps: false,
    });
  
    return Payment_Method;
  };
  