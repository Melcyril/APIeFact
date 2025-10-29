// testCart.js
require('dotenv').config();
const { Cart } = require('./models');

console.log('Champs du modèle Cart :');
console.log(Cart.rawAttributes);
