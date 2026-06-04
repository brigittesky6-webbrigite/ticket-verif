const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ─── Email vers l'utilisateur après soumission ────────────────────────────────
async function envoyerConfirmationSoumission(ticket) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: 'Segoe UI', sans-serif; background: #0a0a0f; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #12121a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a3e; }
      .header { background: linear-gradient(135deg, #6c63ff, #f093fb); padding: 40px 30px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
      .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
      .body { padding: 30px; color: #e0e0e0; }
      .ref-box { background: #1e1e2e; border: 2px solid #6c63ff; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
      .ref-code { font-size: 32px; font-weight: 800; color: #6c63ff; letter-spacing: 4px; font-family: monospace; }
      .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #2a2a3e; }
      .label { color: #888; font-size: 13px; }
      .value { color: #fff; font-weight: 600; font-size: 13px; }
      .status-badge { display: inline-block; background: #f59e0b22; color: #f59e0b; border: 1px solid #f59e0b44; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; }
      .footer { padding: 20px 30px; background: #0d0d16; text-align: center; color: #555; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎫 Demande Reçue</h1>
        <p>Votre ticket est en cours de vérification</p>
      </div>
      <div class="body">
        <p>Bonjour <strong>${ticket.userName}</strong>,</p>
        <p>Nous avons bien reçu votre demande de vérification. Notre équipe va traiter votre ticket dans les plus brefs délais.</p>
        
        <div class="ref-box">
          <p style="margin:0 0 8px; color:#888; font-size:12px;">RÉFÉRENCE DE SUIVI</p>
          <div class="ref-code">#${ticket.reference}</div>
          <p style="margin:8px 0 0; color:#888; font-size:11px;">Conservez cette référence</p>
        </div>

        <div style="margin: 20px 0;">
          <div class="info-row">
            <span class="label">Opérateur</span>
            <span class="value">${ticket.operateur}</span>
          </div>
          <div class="info-row">
            <span class="label">Montant</span>
            <span class="value">${ticket.montant} ${ticket.devise}</span>
          </div>
          <div class="info-row">
            <span class="label">Statut</span>
            <span class="value"><span class="status-badge">⏳ En attente</span></span>
          </div>
          <div class="info-row" style="border: none">
            <span class="label">Date de soumission</span>
            <span class="value">${new Date(ticket.createdAt).toLocaleString('fr-FR')}</span>
          </div>
        </div>

        <p style="color: #888; font-size: 13px;">Vous recevrez une notification par email dès que votre ticket sera traité.</p>
      </div>
      <div class="footer">
        <p>© 2024 TicketVerif · Ce message est envoyé automatiquement</p>
      </div>
    </div>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"TicketVerif" <${process.env.EMAIL_USER}>`,
    to: ticket.userEmail,
    subject: `✅ Confirmation de réception - Réf. #${ticket.reference}`,
    html
  });
}

// ─── Email vers l'admin pour nouvelle demande ─────────────────────────────────
async function notifierAdmin(ticket) {
  const adminUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/admin`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0; }
      .header { background: #1a1a2e; padding: 30px; text-align: center; }
      .header h1 { color: #6c63ff; margin: 0; font-size: 22px; }
      .body { padding: 25px; color: #333; }
      .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 15px 0; }
      .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      .info-table td { padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; }
      .info-table td:first-child { color: #888; width: 40%; }
      .info-table td:last-child { font-weight: 600; }
      .btn { display: inline-block; background: #6c63ff; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 15px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🔔 Nouveau Ticket à Vérifier</h1>
      </div>
      <div class="body">
        <div class="alert-box">
          <strong>Action requise :</strong> Un utilisateur a soumis un ticket en attente de validation.
        </div>
        
        <table class="info-table">
          <tr><td>Référence</td><td>#${ticket.reference}</td></tr>
          <tr><td>Utilisateur</td><td>${ticket.userName}</td></tr>
          <tr><td>Email</td><td>${ticket.userEmail}</td></tr>
          <tr><td>Téléphone</td><td>${ticket.userPhone || 'Non fourni'}</td></tr>
          <tr><td>Opérateur</td><td>${ticket.operateur}</td></tr>
          <tr><td>Montant</td><td>${ticket.montant} ${ticket.devise}</td></tr>
          <tr><td>Code ticket</td><td style="font-family:monospace">${ticket.codeTicket}</td></tr>
          <tr><td>N° de série</td><td>${ticket.numeroserie || 'Non fourni'}</td></tr>
          <tr><td>Soumis le</td><td>${new Date(ticket.createdAt).toLocaleString('fr-FR')}</td></tr>
        </table>
        
        <a href="${adminUrl}" class="btn">→ Accéder au panel admin</a>
      </div>
    </div>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"TicketVerif System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🎫 Nouveau ticket #${ticket.reference} - ${ticket.operateur} ${ticket.montant}${ticket.devise}`,
    html
  });
}

// ─── Email résultat vers l'utilisateur ───────────────────────────────────────
async function envoyerResultat(ticket) {
  const estValide = ticket.statut === 'valide';

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: 'Segoe UI', sans-serif; background: #0a0a0f; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #12121a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a3e; }
      .header { background: ${estValide ? 'linear-gradient(135deg, #11998e, #38ef7d)' : 'linear-gradient(135deg, #c0392b, #e74c3c)'}; padding: 40px 30px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 26px; font-weight: 800; }
      .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
      .body { padding: 30px; color: #e0e0e0; }
      .result-icon { font-size: 60px; text-align: center; margin: 10px 0; }
      .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #2a2a3e; }
      .label { color: #888; font-size: 13px; }
      .value { color: #fff; font-weight: 600; font-size: 13px; }
      .notes-box { background: #1e1e2e; border-radius: 10px; padding: 15px; margin-top: 20px; border-left: 4px solid ${estValide ? '#38ef7d' : '#e74c3c'}; }
      .footer { padding: 20px 30px; background: #0d0d16; text-align: center; color: #555; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="result-icon">${estValide ? '✅' : '❌'}</div>
        <h1>${estValide ? 'Ticket Validé !' : 'Ticket Refusé'}</h1>
        <p>${estValide ? 'Votre ticket a été vérifié et approuvé.' : 'Votre ticket n\'a pas pu être validé.'}</p>
      </div>
      <div class="body">
        <p>Bonjour <strong>${ticket.userName}</strong>,</p>
        <p>La vérification de votre ticket de recharge est terminée.</p>
        
        <div style="margin: 20px 0;">
          <div class="info-row">
            <span class="label">Référence</span>
            <span class="value">#${ticket.reference}</span>
          </div>
          <div class="info-row">
            <span class="label">Opérateur</span>
            <span class="value">${ticket.operateur}</span>
          </div>
          <div class="info-row">
            <span class="label">Montant</span>
            <span class="value">${ticket.montant} ${ticket.devise}</span>
          </div>
          <div class="info-row" style="border:none">
            <span class="label">Résultat</span>
            <span class="value" style="color: ${estValide ? '#38ef7d' : '#e74c3c'}">${estValide ? '✅ VALIDÉ' : '❌ REFUSÉ'}</span>
          </div>
        </div>

        ${ticket.notesAdmin ? `
        <div class="notes-box">
          <p style="margin:0 0 8px; color:#888; font-size:12px; text-transform:uppercase">Message de l'administrateur</p>
          <p style="margin:0; color:#fff">${ticket.notesAdmin}</p>
        </div>` : ''}

        <p style="color: #888; font-size: 13px; margin-top: 20px;">
          ${estValide ? 'Merci de votre confiance. N\'hésitez pas à revenir.' : 'Pour toute question, contactez notre support.'}
        </p>
      </div>
      <div class="footer">
        <p>© 2024 TicketVerif · Ce message est envoyé automatiquement</p>
      </div>
    </div>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"TicketVerif" <${process.env.EMAIL_USER}>`,
    to: ticket.userEmail,
    subject: `${estValide ? '✅ Ticket validé' : '❌ Ticket refusé'} - Réf. #${ticket.reference}`,
    html
  });
}

module.exports = { envoyerConfirmationSoumission, notifierAdmin, envoyerResultat };
