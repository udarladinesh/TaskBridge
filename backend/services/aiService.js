/**
 * Automated AI Service for Task Safety Moderation and Proof Verification
 */

const SENSITIVE_KEYWORDS = {
  highRisk: [
    'weapon', 'gun', 'drug', 'narcotic', 'stalk', 'trespass', 'break in',
    'steal', 'hack', 'password', 'impersonate', 'illegal', 'spy', 'wiretap',
    'assault', 'harass', 'surveillance camera', 'private property unauthorized',
    'credit card', 'atm pin', 'id theft'
  ],
  mediumRisk: [
    'private residence', 'inside home', 'license plate', 'bank account',
    'personal documents', 'unattended luggage', 'restricted area', 'confidential'
  ],
  lowRisk: [
    'cash payment', 'late night', 'urgent cash', 'meet alone'
  ]
};

/**
 * Scan task for safety guidelines and produce risk analysis
 */
const scanTaskSafety = ({ title, description, category, proofRequirement, proofInstructions }) => {
  const fullText = `${title || ''} ${description || ''} ${proofInstructions || ''}`.toLowerCase();
  
  const detectedHigh = SENSITIVE_KEYWORDS.highRisk.filter(k => fullText.includes(k));
  const detectedMed = SENSITIVE_KEYWORDS.mediumRisk.filter(k => fullText.includes(k));
  const detectedLow = SENSITIVE_KEYWORDS.lowRisk.filter(k => fullText.includes(k));

  let score = 100;
  let riskLevel = 'SAFE';
  const flags = [];
  const suggestions = [];

  if (detectedHigh.length > 0) {
    score -= detectedHigh.length * 40;
    riskLevel = 'HIGH_RISK';
    flags.push(`Prohibited terms detected: ${detectedHigh.join(', ')}`);
    suggestions.push('Remove any request for illegal, dangerous, or unauthorized surveillance activities.');
  }

  if (detectedMed.length > 0) {
    score -= detectedMed.length * 20;
    if (riskLevel === 'SAFE') riskLevel = 'MEDIUM_RISK';
    flags.push(`Privacy/Security sensitive terms detected: ${detectedMed.join(', ')}`);
    suggestions.push('Ensure verification is in public venues and respects personal privacy boundaries.');
  }

  if (detectedLow.length > 0) {
    score -= detectedLow.length * 10;
    if (riskLevel === 'SAFE') riskLevel = 'LOW_RISK';
    flags.push(`Caution terms: ${detectedLow.join(', ')}`);
  }

  // Completeness check
  if (!description || description.trim().length < 20) {
    score -= 10;
    suggestions.push('Add more details to the description so taskers understand the exact requirements.');
  }

  if (!proofInstructions || proofInstructions.trim().length < 10) {
    score -= 5;
    suggestions.push('Specify clear proof guidelines (e.g. photos with date/store sign).');
  }

  score = Math.max(0, Math.min(100, score));

  let feedback = 'Task complies with VeriTask community guidelines.';
  if (riskLevel === 'HIGH_RISK') {
    feedback = 'Violates community guidelines. High risk of prohibited activities.';
  } else if (riskLevel === 'MEDIUM_RISK') {
    feedback = 'Contains sensitive elements. Requester review advised before posting.';
  } else if (riskLevel === 'LOW_RISK') {
    feedback = 'Generally safe. Ensure clear communication with taskers.';
  }

  return {
    score,
    riskLevel,
    feedback,
    flags,
    suggestions,
    passed: riskLevel !== 'HIGH_RISK',
    analyzedAt: new Date()
  };
};

/**
 * AI Proof Verification Analyzer
 */
const verifyTaskProof = ({ task, submission }) => {
  const { proofRequirement, proofInstructions, title } = task;
  const { description = '', proofFiles = [] } = submission || {};

  const findings = [];
  let matchScore = 70; // baseline

  // 1. Check proof files against requirement
  if (proofRequirement === 'photo' || proofRequirement === 'video' || proofRequirement === 'document') {
    if (proofFiles.length > 0) {
      matchScore += 15;
      findings.push(`✓ Uploaded ${proofFiles.length} media file(s) matching ${proofRequirement} requirement.`);
    } else {
      matchScore -= 30;
      findings.push(`✗ Missing expected ${proofRequirement} upload.`);
    }
  } else if (proofRequirement === 'multiple') {
    if (proofFiles.length >= 2) {
      matchScore += 20;
      findings.push(`✓ Multi-angle/multi-item evidence provided (${proofFiles.length} files).`);
    } else {
      matchScore -= 15;
      findings.push(`! Only ${proofFiles.length} file provided for multiple-proof requirement.`);
    }
  }

  // 2. Check submission notes length and keywords
  if (description && description.trim().length > 25) {
    matchScore += 10;
    findings.push('✓ Comprehensive completion notes provided by tasker.');
  } else if (!description || description.trim().length < 5) {
    matchScore -= 10;
    findings.push('! Brief or missing completion notes.');
  }

  // 3. Contextual word match
  const taskKeywords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const subText = description.toLowerCase();
  const matchedKeywords = taskKeywords.filter(w => subText.includes(w));
  if (matchedKeywords.length > 0) {
    matchScore += 5;
    findings.push(`✓ Completion notes reference task specifics (${matchedKeywords.join(', ')}).`);
  }

  matchScore = Math.max(15, Math.min(98, matchScore));

  let confidence = 'LOW';
  let recommendation = 'MANUAL_REVIEW';
  let summary = 'Submission requires manual requester review.';

  if (matchScore >= 80) {
    confidence = 'HIGH';
    recommendation = 'RECOMMEND_APPROVE';
    summary = 'Strong evidence match. Uploaded proof meets task instructions.';
  } else if (matchScore >= 60) {
    confidence = 'MEDIUM';
    recommendation = 'MANUAL_REVIEW';
    summary = 'Moderate evidence. Please inspect uploaded files before approving.';
  } else {
    confidence = 'LOW';
    recommendation = 'FLAG_CONCERNS';
    summary = 'Proof details appear incomplete. Please request clarification or dispute.';
  }

  return {
    matchScore,
    confidence,
    recommendation,
    findings,
    summary,
    verifiedAt: new Date()
  };
};

module.exports = {
  scanTaskSafety,
  verifyTaskProof
};
