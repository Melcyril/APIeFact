// helpers/uploadHelper.js

const fs = require('fs');
const path = require('path');
const { Product_Image } = require('../models');

const uploadsDir = path.join(__dirname, '../uploads');

async function cleanUploads() {
  try {
    const images = await Product_Image.findAll({
      attributes: ['image_url']
    });

    const dbFiles = new Set(images.map(img => img.image_url));

    const files = fs.readdirSync(uploadsDir);

    let deleted = 0;

    for (const file of files) {
      if (!dbFiles.has(file)) {
        const filePath = path.join(uploadsDir, file);
        fs.unlinkSync(filePath);
        deleted++;
      }
    }

    return deleted;

  } catch (error) {
    throw error;
  }
}

module.exports = {
  cleanUploads
};