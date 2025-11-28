// Decide status from a prediction/history record
export function computeStatus(p) {
  if (!p) return "Monitoring";

  // 1) explicit override: if record already has a status use it
  if (p.status && typeof p.status === "string") return p.status;

  // 2) if label or details clearly indicate healthy -> Healthy
  const label = (p.label || p.name || p.title || "").toString();
  const healthText = (p.details?.health_status || "").toString();
  if (/healthy/i.test(label) || /healthy/i.test(healthText)) return "Healthy";

  // 3) confidence (predictions.json uses 0..1)
  const conf = Number.isFinite(p.confidence) ? Number(p.confidence) : (p.confidence_percent || 0);
  // normalize if percent given (e.g. 92 -> 0.92)
  const normConf = conf > 1 ? conf / 100 : conf;

  // 4) severity keyword (if present) — use as strong signal
  const sev = (p.severity || p.severity_level || p.details?.severity || "").toString().toLowerCase();

  // Heuristic thresholds (tweak these to match model behaviour)
  const TREATMENT_THRESHOLD = 0.90; // >= 90% -> treatment needed
  const MONITOR_THRESHOLD = 0.70;   // >= 70% -> monitoring (or treatment if severe)
  const LOW_THRESHOLD = 0.40;       // < 40% -> lower confidence (treat as monitoring)

  // Rule: explicit severe -> Treatment Needed
  if (/severe|high/.test(sev)) {
    if (normConf >= 0.5) return "Treatment Needed";
    return "Monitoring";
  }

  // If model is very confident and label is non-healthy -> Treatment Needed
  if (normConf >= TREATMENT_THRESHOLD) return "Treatment Needed";

  // High-ish confidence -> Monitoring (but if we want more conservative: treat as Treatment Needed)
  if (normConf >= MONITOR_THRESHOLD) return "Monitoring";

  // Low confidence -> Monitoring (do not mark Healthy by default)
  return "Monitoring";
}
