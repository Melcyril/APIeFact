const fs = require('fs');
const path = require('path');
const { Product_Image } = require('./models'); // adapte le chemin si besoin

const uploadsDir = path.join(__dirname, 'uploads');

async function cleanUploads() {
  try {
    // 📦 1. Récupérer toutes les images en base
    const images = await Product_Image.findAll({
      attributes: ['image_url']
    });

    const dbFiles = new Set(images.map(img => img.image_url));

    // 📁 2. Lire le dossier uploads
    const files = fs.readdirSync(uploadsDir);

    let deleted = 0;

    // 🔍 3. comparer fichiers vs DB
    for (const file of files) {
      if (!dbFiles.has(file)) {
        const filePath = path.join(uploadsDir, file);

        fs.unlinkSync(filePath);
        deleted++;

        console.log(`🗑️ supprimé : ${file}`);
      }
    }

    console.log(`✅ Nettoyage terminé. Fichiers supprimés : ${deleted}`);

  } catch (error) {
    console.error('❌ Erreur nettoyage uploads :', error);
  }
}

cleanUploads();