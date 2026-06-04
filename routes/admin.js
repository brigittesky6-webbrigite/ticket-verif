const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Ticket = require('../models/Ticket');
const { envoyerResultat } = require('../middleware/email');

// Middleware d'authentification admin
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.status(401).json({ error: 'Non autorisé' });
}

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecure2024!';

  if (password === adminPassword) {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    // Délai pour éviter brute force
    await new Promise(r => setTimeout(r, 1000));
    res.status(401).json({ error: 'Mot de passe incorrect' });
  }
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// GET /api/admin/check - Vérifier si connecté
router.get('/check', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// GET /api/admin/tickets - Liste tous les tickets
router.get('/tickets', requireAdmin, async (req, res) => {
  try {
    const { statut, page = 1, limit = 20 } = req.query;
    const filter = statut ? { statut } : {};

    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Ticket.countDocuments(filter);
    const stats = await Ticket.aggregate([
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);

    res.json({ tickets, total, stats });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/admin/tickets/:id - Valider ou refuser un ticket
router.patch('/tickets/:id', requireAdmin, async (req, res) => {
  try {
    const { statut, notesAdmin } = req.body;

    if (!['valide', 'refuse', 'en_cours'].includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { statut, notesAdmin, updatedAt: new Date() },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket introuvable' });
    }

    // Envoyer notification email si validé ou refusé
    if (['valide', 'refuse'].includes(statut)) {
      envoyerResultat(ticket).catch(e => console.error('Email résultat:', e));
    }

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/tickets/:id - Détail d'un ticket
router.get('/tickets/:id', requireAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Introuvable' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
