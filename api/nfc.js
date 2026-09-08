// /api/nfc.js — Vercel serverless function
// Permanent NFC card endpoint: card stores https://ovuluna.vercel.app/api/nfc?card=CARD_ID
// Backend redirects based on: card validity, season, promotion, user subscription
// The card link NEVER changes — backend controls destination per season/campaign

const SEASONS = {
  // Northern hemisphere seasons (adjust for Singapore/Southeast Asia if needed)
  spring: { months: [2, 3, 4], label: 'Spring Renewal', theme: 'follicular' },
  summer: { months: [5, 6, 7], label: 'Summer Radiance', theme: 'ovulation' },
  autumn: { months: [8, 9, 10], label: 'Autumn Nurturing', theme: 'luteal' },
  winter: { months: [11, 0, 1], label: 'Winter Rest', theme: 'menstrual' }
};

// Season-specific promotions — update these per campaign
const SEASON_OFFERS = {
  spring: {
    title: 'Spring Renewal Offer',
    discount: '20% off annual premium',
    landing: '/premium.html?offer=spring20',
    guide: '/learn-cycle-phases.html?focus=follicular'
  },
  summer: {
    title: 'Summer Radiance Offer',
    discount: 'Free NFC card with annual plan',
    landing: '/premium.html?offer=summer',
    guide: '/foods.html?phase=ovulation'
  },
  autumn: {
    title: 'Autumn Nurturing Offer',
    discount: '15% off + TCM herb guide',
    landing: '/premium.html?offer=autumn',
    guide: '/tcm-hub.html'
  },
  winter: {
    title: 'Winter Rest Offer',
    discount: 'Free breathwork series',
    landing: '/premium.html?offer=winter',
    guide: '/breathe.html'
  }
};

function getCurrentSeason() {
  const month = new Date().getMonth();
  for (const [key, season] of Object.entries(SEASONS)) {
    if (season.months.includes(month)) return { key, ...season };
  }
  return { key: 'spring', ...SEASONS.spring };
}

export default async function handler(req, res) {
  const cardId = req.query.card || 'unknown';
  const action = req.query.action || 'tap'; // tap, verify, foodscan, checkin

  const season = getCurrentSeason();
  const offer = SEASON_OFFERS[season.key];

  // Card ID format: ovuluna-{type}-{uniqueId}
  // e.g., ovuluna-premium-a1b2c3, ovuluna-gift-x7y8z9
  const cardParts = cardId.split('-');
  const cardType = cardParts[1] || 'standard';
  const isPremiumCard = cardType === 'premium' || cardType === 'gift';

  // Determine redirect destination based on action and card type
  let redirectUrl;
  let message;

  switch (action) {
    case 'foodscan':
      // Card used as food scan reference object
      redirectUrl = '/food-scan.html?ref=card&card=' + cardId;
      message = 'Card detected as size reference. Food scan ready.';
      break;

    case 'checkin':
      // Quick daily check-in
      redirectUrl = '/home.html?checkin=nfc&card=' + cardId;
      message = 'Check-in initiated. How are you feeling today?';
      break;

    case 'verify':
      // Return JSON verification (used by app)
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({
        cardId,
        cardType,
        isPremium: isPremiumCard,
        season: season.key,
        seasonLabel: season.label,
        offer: offer.title,
        discount: offer.discount,
        timestamp: new Date().toISOString()
      });

    case 'tap':
    default:
      // Default tap behavior — premium cards go to premium hub,
      // standard cards go to season offer
      if (isPremiumCard) {
        redirectUrl = '/premium.html?nfc=tap&card=' + cardId + '&season=' + season.key;
        message = `Welcome premium member. ${season.label} edition.`;
      } else {
        redirectUrl = offer.landing + '&nfc=tap&card=' + cardId;
        message = `${offer.title}: ${offer.discount}`;
      }
      break;
  }

  // For HTML redirect (NFC tap opens browser)
  if (req.query.format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      redirect: redirectUrl,
      message,
      cardId,
      cardType,
      isPremium: isPremiumCard,
      season: season.key,
      seasonLabel: season.label,
      offer: offer.title
    });
  }

  // 302 redirect — permanent card link, dynamic destination
  res.setHeader('Location', redirectUrl);
  res.setHeader('X-NFC-Card', cardId);
  res.setHeader('X-NFC-Season', season.key);
  return res.status(302).end();
}
