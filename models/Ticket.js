const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ticketSchema = new mongoose.Schema({
  // Référence unique de la demande
  reference: {
    type: String,
    default: () => uuidv4().split('-')[0].toUpperCase(),
    unique: true
  },

  // Informations utilisateur
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userPhone: {
    type: String,
    trim: true
  },

  // Informations du ticket
  operateur: {
    type: String,
    required: true,
    enum: ['Transcash', 'PCS Mastercard', 'Neosurf', 'Paysafecard', 'CashLib', 'Ticket Premium', 'Astropay', 'Toneo First']
  },
  montant: {
    type: String,
    required: true,
    enum: ['10', '20', '25', '50', '100', '150', '200', '250', '500']
  },
  devise: {
    type: String,
    required: true,
    enum: ['EUR', 'USD'],
    default: 'EUR'
  },
  codeTicket: {
    type: String,
    required: true,
    trim: true
  },
  numeroserie: {
    type: String,
    trim: true
  },

  // Statut de validation
  statut: {
    type: String,
    enum: ['en_attente', 'valide', 'refuse', 'en_cours'],
    default: 'en_attente'
  },

  // Notes admin
  notesAdmin: {
    type: String,
    trim: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Email de notification envoyé
  notificationEnvoyee: {
    type: Boolean,
    default: false
  }
});

ticketSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
