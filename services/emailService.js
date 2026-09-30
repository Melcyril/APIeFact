
// services/emailService.js

const nodemailer = require("nodemailer");
require("dotenv").config();

// =====================================================
// 📧 CONFIGURATION SMTP GMAIL
// =====================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },
});


// =====================================================
// 🔍 VÉRIFICATION CONNEXION SMTP
// =====================================================

transporter.verify((error) => {

  if (error) {

    console.error(
      "❌ Erreur connexion SMTP Gmail :",
      error
    );

  } else {

    console.log(
      "✅ Connexion SMTP Gmail réussie"
    );

  }

});


// =====================================================
// 📧 EMAIL DE BIENVENUE
// =====================================================

const sendWelcomeEmail = async (to, name) => {

  try {

    const info = await transporter.sendMail({

      from: `"Mon E-commerce" <${process.env.SMTP_USER}>`,

      to,

      subject: "Bienvenue sur MonShop !",

      text: `Salut ${name || ""}, merci pour ton inscription !`,
    });

    console.log(
      "✅ Email de bienvenue envoyé :",
      info.messageId
    );

    return info;

  } catch (error) {

    console.error(
      "❌ Erreur email bienvenue :",
      error
    );

    throw error;
  }
};


// =====================================================
// 🔐 EMAIL RESET PASSWORD
// =====================================================

const sendPasswordResetEmail = async (to, token) => {

  const resetLink =
    `http://localhost:4200/reset-password/${token}`;

  try {

    const info = await transporter.sendMail({

      from: `"Mon E-commerce" <${process.env.SMTP_USER}>`,

      to,

      subject: "Réinitialisation de votre mot de passe",

      text: `Bonjour,

Pour réinitialiser votre mot de passe, cliquez sur ce lien :

${resetLink}

Ce lien est valable 1 heure.`,
    });

    console.log(
      "✅ Email reset envoyé :",
      info.messageId
    );

    return info;

  } catch (error) {

    console.error(
      "❌ Erreur email reset :",
      error
    );

    throw error;
  }
};


// =====================================================
// 🛒 EMAIL CONFIRMATION COMMANDE
// =====================================================

const sendOrderConfirmationEmail = async (to, order) => {

  console.log("");
  console.log("========================================");
  console.log("📧 EMAIL CONFIRMATION COMMANDE");
  console.log("➡️ Destinataire :", to);
  console.log("➡️ Commande :", order?.id);
  console.log("========================================");

  try {

    // -------------------------------------------------
    // 🔎 Vérification des données
    // -------------------------------------------------

    if (!to) {
      throw new Error(
        "Adresse email destinataire manquante."
      );
    }

    if (!order) {
      throw new Error(
        "Données de commande manquantes."
      );
    }

    if (!Array.isArray(order.items)) {
      throw new Error(
        "La liste des produits de la commande est invalide."
      );
    }


    // -------------------------------------------------
    // 🛍️ PRODUITS
    // -------------------------------------------------

    const itemsText = order.items
      .map((item) => {

        const nom =
          item?.nom || "Produit";

        const quantite =
          Number(item?.quantite || 0);

        const prixTTC =
          Number(item?.prixTTC || 0);

        const montantRemise =
          Number(item?.montantRemise || 0);

        const prixTTCfinal =
          Number(item?.prixTTCfinal || 0);

        const totalItem =
          (prixTTCfinal * quantite).toFixed(2);

        return `
${nom} x ${quantite}
  Prix TTC : ${prixTTC.toFixed(2)} €
  Remise : -${montantRemise.toFixed(2)} €
  Total ligne : ${totalItem} €
`;

      })
      .join("\n");


    // -------------------------------------------------
    // 💰 VALEURS TOTALES
    // -------------------------------------------------

    const totalRemise =
      Number(order.total_remise || 0).toFixed(2);

    const fraisLivraison =
      Number(order.frais_livraison || 0).toFixed(2);

    const totalTTC =
      Number(order.total_ttc || 0).toFixed(2);

    const totalAPayer =
      Number(order.total_a_payer || 0).toFixed(2);


    // -------------------------------------------------
    // 📍 ADRESSE
    // -------------------------------------------------

    const nomLivraison =
      order.nom_livraison || "";

    const prenomLivraison =
      order.prenom_livraison || "";

    const adresseLivraison =
      order.adresse_livraison || "";

    const codePostal =
      order.code_postal || "";

    const ville =
      order.ville || "";

    const telephone =
      order.telephone || "";


    // -------------------------------------------------
    // 📝 CONTENU EMAIL
    // -------------------------------------------------

    const text = `
Bonjour ${order.nom_client || ""},

Merci pour votre commande !

========================================
COMMANDE #${order.id}
========================================

${itemsText}

----------------------------------------
Total des remises : -${totalRemise} €
Livraison : ${fraisLivraison} €
Total produits TTC : ${totalTTC} €
TOTAL À PAYER : ${totalAPayer} €
----------------------------------------

Adresse de livraison :

${nomLivraison} ${prenomLivraison}
${adresseLivraison}
${codePostal} ${ville}

Téléphone : ${telephone}

========================================

Merci pour votre confiance !

MonShop
`;


    // -------------------------------------------------
    // 📤 ENVOI
    // -------------------------------------------------

    console.log("📤 Envoi de l'email vers Gmail...");

    const info = await transporter.sendMail({

      from: `"Mon E-commerce" <${process.env.SMTP_USER}>`,

      to,

      subject: `Confirmation de commande #${order.id}`,

      text,

    });


    // -------------------------------------------------
    // ✅ SUCCÈS
    // -------------------------------------------------

    console.log("");
    console.log("========================================");
    console.log("✅ EMAIL COMMANDE ENVOYÉ");
    console.log("📨 Message ID :", info.messageId);
    console.log("📬 Accepted :", info.accepted);
    console.log("❌ Rejected :", info.rejected);
    console.log("📡 Response :", info.response);
    console.log("========================================");
    console.log("");


    return info;


  } catch (error) {

    console.error("");
    console.error("========================================");
    console.error("❌ ERREUR EMAIL COMMANDE");
    console.error("Code :", error?.code);
    console.error("Command :", error?.command);
    console.error("Message :", error?.message);
    console.error("Stack :", error?.stack);
    console.error("========================================");
    console.error("");

    throw error;
  }
};


// =====================================================
// 📤 EXPORTS
// =====================================================

module.exports = {

  sendWelcomeEmail,

  sendPasswordResetEmail,

  sendOrderConfirmationEmail

};

