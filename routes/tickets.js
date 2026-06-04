const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { envoyerConfirmationSoumission, notifierAdmin } = require('../middleware/email');

// POST /api/tickets - Soumettre un nouveau ticket
router.post('/', async (req, res) => {
  try {
    const {
      userEmail, userName, userPhone,
      operateur, montant, devise,
      codeTicket, numeroserie
    } = req.body;

    // Validation basique
    if (!userEmail || !userName || !operateur || !montant || !codeTicket) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis.' });
    }

    // Vérifier si le code n'a pas déjà été soumis récemment
    const existant = await Ticket.findOne({ codeTicket: codeTicket.trim() });
    if (existant) {
      return res.status(409).json({
        error: 'Ce code de ticket a déjà été soumis.',
        reference: existant.reference,
        statut: existant.statut
      });
    }

    const ticket = new Ticket({
      userEmail: userEmail.trim(),
      userName: userName.trim(),
      userPhone: userPhone?.trim(),
      operateur,
      montant,
      devise: devise || 'EUR',
      codeTicket: codeTicket.trim().toUpperCase(),
      numeroserie: numeroserie?.trim()
    });

    await ticket.save();

    // Envoyer les emails (asynchrone, ne bloque pas la réponse)
    Promise.all([
      envoyerConfirmationSoumission(ticket).catch(e => console.error('Email user:', e)),
      notifierAdmin(ticket).catch(e => console.error('Email admin:', e))
    ]);

    res.status(201).json({
      success: true,
      message: 'Ticket soumis avec succès !',
      reference: ticket.reference
    });

  } catch (error) {
    console.error('Erreur soumission ticket:', error);
    res.status(500).json({ error: 'Erreur lors de la soumission.' });
  }
});

// GET /api/tickets/suivi/:reference - Suivi d'un ticket
router.get('/suivi/:reference', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      reference: req.params.reference.toUpperCase()
    }).select('-codeTicket -numeroserie'); // Masquer le code pour sécurité

    if (!ticket) {
      return res.status(404).json({ error: 'Référence introuvable.' });
    }

    res.json({
      reference: ticket.reference,
      operateur: ticket.operateur,
      montant: ticket.montant,
      devise: ticket.devise,
      statut: ticket.statut,
      notesAdmin: ticket.notesAdmin,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    });

  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la recherche.' });
  }
});

module.exports = router;
