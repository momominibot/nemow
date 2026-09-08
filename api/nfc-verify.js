// /api/nfc-verify.js — Vercel serverless function
// Verifies NFC card token and returns user subscription status
// NFC cards store a URL like: https://ovuluna.vercel.app/nfc?token=USER_SPECIFIC_TOKEN

// In production, this would query a database. For now, uses localStorage-compatible
// token format: ovuluna-premium-{userId}-{expiryTimestamp}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const token = req.query.token || (req.body && req.body.token);

    if (!token) {
      return res.status(400).json({
        valid: false,
        error: 'No token provided',
        message: 'Tap your Ovuluna Premium card to verify.'
      });
    }

    // Parse token format: ovuluna-premium-{userId}-{expiry}
    const parts = token.split('-');
    if (parts.length < 4 || parts[0] !== 'ovuluna' || parts[1] !== 'premium') {
      return res.status(200).json({
        valid: false,
        error: 'Invalid token format',
        message: 'This card is not a valid Ovuluna Premium card.'
      });
    }

    const userId = parts.slice(2, -1).join('-');
    const expiry = parseInt(parts[parts.length - 1], 10);
    const now = Math.floor(Date.now() / 1000);

    if (isNaN(expiry) || expiry < now) {
      return res.status(200).json({
        valid: false,
        expired: true,
        userId,
        message: 'This premium card has expired. Please renew your subscription.',
        renewalUrl: '/premium.html'
      });
    }

    const daysRemaining = Math.ceil((expiry - now) / 86400);

    return res.status(200).json({
      valid: true,
      userId,
      expiry,
      expiryDate: new Date(expiry * 1000).toISOString().split('T')[0],
      daysRemaining,
      tier: 'premium',
      perks: [
        'Unlimited Luna AI questions (100/day)',
        'AI Food Scan with portion estimation',
        'Full TCM library (herbs, acupoints, formulas)',
        'Premium breathwork & meditation sessions',
        'Advanced cycle analytics & trends',
        'Exclusive knowledge hub videos',
        'Physical Ovuluna Premium NFC card'
      ],
      message: 'Welcome back, premium member. Your card is active.'
    });

  } catch (error) {
    console.error('NFC verify error:', error);
    return res.status(500).json({
      valid: false,
      error: 'Server error',
      message: 'Could not verify card. Please try again.'
    });
  }
}
