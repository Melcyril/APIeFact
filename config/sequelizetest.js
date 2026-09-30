require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // base en mémoire uniquement pour les tests
  logging: false,      // désactive les logs SQL pendant les tests
});

module.exports = sequelize;
