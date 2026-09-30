const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Créer un PaymentIntent
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency = "eur" } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    // Stripe créer un paiement sécurisé
    const paymentIntent = await stripe.paymentIntents.create({
      amount,         // montant en centimes
      currency,
      automatic_payment_methods: { enabled: true } // Formulaire carte automatique
    });

    return res.json({
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur Stripe" });
  }
});

module.exports = router;
