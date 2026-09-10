/* ══════════════════════════════════════════════════════════════
   OVULUNA · Wellness Habit Score
   A general wellness product for personal awareness and lifestyle motivation.
   
   ⚠️  WELLNESS, NOT MEDICAL:
   This tool is a GENERAL WELLNESS product. It does NOT:
   - Diagnose, cure, mitigate, treat, or prevent any disease or condition
   - Predict mortality, disease risk, or clinical outcomes
   - Replace professional medical advice, diagnosis, or treatment
   - Constitute a medical device or clinical measurement
   
   The score reflects self-reported wellness habits for personal awareness
   and lifestyle motivation. It is not a biological age, clinical biomarker,
   or health assessment.
   
   OPTIONAL RESEARCH-GRADE PHENOAGE:
   If user provides ALL 9 complete blood biomarkers with correct units,
   the PhenoAge research formula (Levine et al., 2018) can be calculated
   as an educational reference. This requires: albumin(g/L), creatinine(µmol/L),
   glucose(mmol/L), CRP(mg/dL), lymphocyte(%), MCV(fL), RDW(%),
   alkaline phosphatase(U/L), WBC(10^3/µL), and chronological age.
   PhenoAge is a research model, not a clinical diagnostic.
   ══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const STORAGE_KEY = 'ovuluna_wellness_data';

  const WELLNESS_DISCLAIMER = 'This is a wellness habit score for personal awareness and lifestyle motivation only. It is not a medical diagnosis, clinical measurement, biological age, or predictor of health outcomes. Always consult a qualified healthcare professional for medical advice.';

  /* ── PhenoAge coefficients (Levine et al., 2018, Aging, Table 1) ──
     REQUIRED UNITS (must convert before use):
     - albumin: g/L (multiply g/dL × 10)
     - creatinine: µmol/L (multiply mg/dL × 88.4)
     - glucose: mmol/L (divide mg/dL ÷ 18.0182)
     - CRP: mg/dL (divide mg/L ÷ 10) BEFORE log
     - lymphocyte: %
     - MCV: fL
     - RDW: %
     - alkaline phosphatase: U/L
     - WBC: 10^3 cells/µL
  */
  const PHENO_COEFFS = {
    intercept: -19.90667,
    age: 0.08035356,
    albumin: -0.03359355,
    creatinine: 0.009506491,
    glucose: 0.1953192,
    crp_log: 0.09536762,
    lymphocyte_pct: -0.01199984,
    mcv: 0.02676401,
    rdw: 0.3306156,
    alkaline_phosphatase: 0.001868778,
    wbc: 0.05542406
  };

  // Gompertz transformation constants (from original PhenoAge implementation)
  const PHENO_GAMMA = 0.007692696;
  const PHENO_A = 141.50225;
  const PHENO_B = 0.0055305;
  const PHENO_C = 0.090165;
  const PHENO_FOLLOWUP_MONTHS = 120;

  /* ── Convert common US lab units to PhenoAge-required units ── */
  function convertToPhenoUnits(b) {
    return {
      albumin: (b.albumin_gdL || b.albumin || 0) * 10, // g/dL → g/L
      creatinine: (b.creatinine_mgdL || b.creatinine || 0) * 88.4, // mg/dL → µmol/L
      glucose: (b.glucose_mgdL || b.glucose || 0) / 18.0182, // mg/dL → mmol/L
      crp: (b.crp_mgdL || (b.crp_mgL || b.crp || 0) / 10), // mg/L → mg/dL
      lymphocyte_pct: b.lymphocyte_pct || b.lymphocyte || 0,
      mcv: b.mcv || 0,
      rdw: b.rdw || 0,
      alkaline_phosphatase: b.alkaline_phosphatase || b.alk_phos || 0,
      wbc: b.wbc || 0
    };
  }

  /* ── Validate that all 9 biomarkers are present and in valid range ── */
  function validateBiomarkers(b) {
    const checks = [
      { key: 'albumin', min: 20, max: 60 },
      { key: 'creatinine', min: 20, max: 400 },
      { key: 'glucose', min: 2, max: 30 },
      { key: 'crp', min: 0.01, max: 50 },
      { key: 'lymphocyte_pct', min: 5, max: 70 },
      { key: 'mcv', min: 60, max: 120 },
      { key: 'rdw', min: 10, max: 25 },
      { key: 'alkaline_phosphatase', min: 20, max: 500 },
      { key: 'wbc', min: 2, max: 30 }
    ];
    const missing = [];
    const invalid = [];
    for (const c of checks) {
      const val = b[c.key];
      if (val === undefined || val === null || val === 0 || isNaN(val)) {
        missing.push(c.key);
      } else if (val < c.min || val > c.max) {
        invalid.push(c.key + '=' + val);
      }
    }
    return { valid: missing.length === 0 && invalid.length === 0, missing, invalid };
  }

  /* ── Calculate PhenoAge (research formula, requires all 9 biomarkers) ── */
  function calculatePhenoAge(biomarkers, chronologicalAge) {
    if (!chronologicalAge || typeof chronologicalAge !== 'number' || isNaN(chronologicalAge) ||
        chronologicalAge < 18 || chronologicalAge > 100) {
      return { error: 'Valid chronological age (18-100) required' };
    }
    
    const converted = convertToPhenoUnits(biomarkers);
    const validation = validateBiomarkers(converted);
    if (!validation.valid) {
      return {
        error: 'Complete biomarker panel required',
        missing: validation.missing,
        invalid: validation.invalid,
        note: 'PhenoAge requires all 9 biomarkers. Partial data cannot produce a valid estimate.'
      };
    }
    
    const b = converted;
    const c = PHENO_COEFFS;
    const crpLog = Math.log(Math.max(0.01, b.crp));
    
    // Linear combination (xb)
    const xb = c.intercept +
      c.age * chronologicalAge +
      c.albumin * b.albumin +
      c.creatinine * b.creatinine +
      c.glucose * b.glucose +
      c.crp_log * crpLog +
      c.lymphocyte_pct * b.lymphocyte_pct +
      c.mcv * b.mcv +
      c.rdw * b.rdw +
      c.alkaline_phosphatase * b.alkaline_phosphatase +
      c.wbc * b.wbc;
    
    // Gompertz survival transformation (from original implementation)
    const H = Math.exp(xb) * (Math.exp(PHENO_FOLLOWUP_MONTHS * PHENO_GAMMA) - 1) / PHENO_GAMMA;
    const M = 1 - Math.exp(-H);
    const phenoAge = PHENO_A + Math.log(-PHENO_B * Math.log(1 - M)) / PHENO_C;
    
    return {
      phenoAge: Math.round(phenoAge * 10) / 10,
      chronologicalAge,
      isResearchModel: true,
      note: 'PhenoAge is a research-grade model (Levine et al., 2018). It is provided for educational reference only and is not a clinical diagnostic or health assessment.'
    };
  }

  /* ── Wellness Habit Score (0-100, higher = more wellness-supportive habits) ──
     Based on self-reported lifestyle factors only.
     This is NOT a biological age or clinical measurement.
  */
  function calculateWellnessScore(lifestyle) {
    if (!lifestyle) return { score: null, note: 'No lifestyle data provided' };
    
    let score = 0;
    const factors = [];
    const l = lifestyle;
    
    // Sleep: 7-9 hours + good quality (max 20 points)
    let sleepPoints = 0;
    if (l.sleepHours >= 7 && l.sleepHours <= 9) sleepPoints += 10;
    else if (l.sleepHours >= 6 && l.sleepHours < 7 || l.sleepHours > 9 && l.sleepHours <= 10) sleepPoints += 5;
    if (l.sleepQuality >= 4) sleepPoints += 10;
    else if (l.sleepQuality >= 3) sleepPoints += 5;
    score += sleepPoints;
    factors.push({ name: 'Sleep', points: sleepPoints, max: 20, icon: 'bedtime' });
    
    // Physical activity: 150+ min/week moderate (max 20 points)
    let exercisePoints = 0;
    if (l.exerciseMinPerWeek >= 150) exercisePoints = 20;
    else if (l.exerciseMinPerWeek >= 75) exercisePoints = 12;
    else if (l.exerciseMinPerWeek >= 30) exercisePoints = 6;
    score += exercisePoints;
    factors.push({ name: 'Physical Activity', points: exercisePoints, max: 20, icon: 'directions_run' });
    
    // Nutrition quality (self-rated 1-5, max 15 points)
    let nutritionPoints = 0;
    if (l.nutritionQuality >= 4) nutritionPoints = 15;
    else if (l.nutritionQuality >= 3) nutritionPoints = 9;
    else if (l.nutritionQuality >= 2) nutritionPoints = 4;
    score += nutritionPoints;
    factors.push({ name: 'Nutrition', points: nutritionPoints, max: 15, icon: 'restaurant' });
    
    // Stress management / HRV (max 15 points)
    let stressPoints = 0;
    if (l.hrvRmssd >= 50) stressPoints = 15;
    else if (l.hrvRmssd >= 30) stressPoints = 10;
    else if (l.hrvRmssd >= 15) stressPoints = 5;
    if (l.dailyBreathworkMin >= 10) stressPoints = Math.min(15, stressPoints + 3);
    score += Math.min(15, stressPoints);
    factors.push({ name: 'Stress Management', points: Math.min(15, stressPoints), max: 15, icon: 'spa' });
    
    // Hydration (max 10 points)
    let hydrationPoints = 0;
    if (l.waterGlassesPerDay >= 8) hydrationPoints = 10;
    else if (l.waterGlassesPerDay >= 6) hydrationPoints = 7;
    else if (l.waterGlassesPerDay >= 4) hydrationPoints = 4;
    score += hydrationPoints;
    factors.push({ name: 'Hydration', points: hydrationPoints, max: 10, icon: 'water_drop' });
    
    // Avoid smoking (max 10 points)
    let smokingPoints = l.smoker ? 0 : 10;
    score += smokingPoints;
    factors.push({ name: 'No Smoking', points: smokingPoints, max: 10, icon: 'smoke_free' });
    
    // Alcohol moderation (max 10 points)
    let alcoholPoints = 0;
    if (l.alcoholPerWeek <= 7) alcoholPoints = 10;
    else if (l.alcoholPerWeek <= 14) alcoholPoints = 5;
    score += alcoholPoints;
    factors.push({ name: 'Alcohol Moderation', points: alcoholPoints, max: 10, icon: 'wine_bar' });
    
    return {
      score: Math.round(score),
      maxScore: 100,
      factors,
      level: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Developing' : 'Getting Started',
      note: 'This score reflects self-reported wellness habits. It is not a biological age, health assessment, or clinical measurement.'
    };
  }

  /* ── Generate wellness suggestions (non-diagnostic, lifestyle-focused) ── */
  function generateWellnessSuggestions(lifestyle) {
    const suggestions = [];
    if (!lifestyle) return suggestions;
    
    if (lifestyle.sleepHours < 7 || lifestyle.sleepQuality < 3) {
      suggestions.push({
        icon: 'bedtime',
        title: 'Consider improving sleep routine',
        detail: 'Aim for 7-9 hours of consistent sleep. Try a regular bedtime and a wind-down routine before bed.',
        type: 'wellness'
      });
    }
    
    if (lifestyle.exerciseMinPerWeek < 150) {
      suggestions.push({
        icon: 'directions_run',
        title: 'Consider adding more movement',
        detail: 'Aim for 150+ minutes of moderate activity per week. Walking, stretching, or any movement you enjoy counts.',
        type: 'wellness'
      });
    }
    
    if (lifestyle.nutritionQuality < 3) {
      suggestions.push({
        icon: 'restaurant',
        title: 'Consider nourishing food choices',
        detail: 'Focus on vegetables, fruits, whole grains, lean proteins, and healthy fats. Small consistent changes add up.',
        type: 'wellness'
      });
    }
    
    if (lifestyle.hrvRmssd < 30 || !lifestyle.dailyBreathworkMin) {
      suggestions.push({
        icon: 'spa',
        title: 'Consider a daily stress-management practice',
        detail: 'Try 5-10 minutes of slow breathing, meditation, or gentle movement daily. Find what helps you relax.',
        type: 'wellness'
      });
    }
    
    if (lifestyle.waterGlassesPerDay < 6) {
      suggestions.push({
        icon: 'water_drop',
        title: 'Consider staying hydrated',
        detail: 'Aim for 6-8 glasses of water daily. Keep a water bottle nearby as a reminder.',
        type: 'wellness'
      });
    }
    
    // Always include disclaimer
    suggestions.push({
      icon: 'info',
      title: 'Wellness, not medical',
      detail: WELLNESS_DISCLAIMER,
      type: 'disclaimer'
    });
    
    return suggestions;
  }

  /* ── Main entry: calculate wellness score (and optional PhenoAge if full panel) ── */
  function calculateWellness(input) {
    const { chronologicalAge, biomarkers, lifestyle } = input;
    
    // Validate chronological age strictly
    if (!chronologicalAge || typeof chronologicalAge !== 'number' || isNaN(chronologicalAge) ||
        chronologicalAge < 18 || chronologicalAge > 100) {
      return { error: 'Valid chronological age (18-100, number) required for any calculation.' };
    }
    
    const result = {
      chronologicalAge,
      isWellnessTool: true,
      disclaimer: WELLNESS_DISCLAIMER,
      lastUpdated: new Date().toISOString()
    };
    
    // Wellness habit score (primary output)
    if (lifestyle && Object.keys(lifestyle).length > 0) {
      result.wellnessScore = calculateWellnessScore(lifestyle);
      result.suggestions = generateWellnessSuggestions(lifestyle);
    } else {
      result.wellnessScore = { score: null, note: 'Add your lifestyle data to see your wellness habit score.' };
      result.suggestions = [{ icon: 'info', title: 'Getting started', detail: 'Log your sleep, activity, nutrition, and stress habits to see your personalized wellness score and suggestions.', type: 'info' }];
    }
    
    // Optional PhenoAge (only if ALL 9 biomarkers provided)
    if (biomarkers && Object.keys(biomarkers).length >= 5) {
      const phenoResult = calculatePhenoAge(biomarkers, chronologicalAge);
      if (phenoResult.error) {
        result.phenoAge = {
          available: false,
          reason: phenoResult.error,
          missing: phenoResult.missing,
          note: phenoResult.note
        };
      } else {
        result.phenoAge = {
          available: true,
          value: phenoResult.phenoAge,
          isResearchModel: true,
          note: phenoResult.note
        };
      }
    }
    
    return result;
  }

  /* ── Save / Load ── */
  function saveResult(result) {
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      history.push(result);
      if (history.length > 12) history.shift();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      return true;
    } catch(e) { return false; }
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch(e) { return []; }
  }

  /* ── Export ── */
  window.OvulunaWellness = {
    calculateWellness,
    calculateWellnessScore,
    calculatePhenoAge,
    convertToPhenoUnits,
    validateBiomarkers,
    PHENO_COEFFS,
    WELLNESS_DISCLAIMER,
    saveResult,
    getHistory
  };

})();
