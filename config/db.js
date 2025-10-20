const mysql = require('mysql2');

// Créer la connexion à la base de données MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,  // récupère l'host de la variable d'environnement
  user: process.env.DB_USER,  // récupère l'utilisateur de la BDD
  password: process.env.DB_PASSWORD,  // récupère le mot de passe de la BDD
  database: process.env.DB_NAME  // récupère le nom de la BDD
});

// Tester la connexion
connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err.stack);
    return;
  }
  console.log('Connecté à la base de données MySQL avec l\'ID', connection.threadId);
});

module.exports = connection;  // Exporter la connexion pour l'utiliser ailleurs dans ton code
