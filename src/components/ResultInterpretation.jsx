import React from "react";

// Props: label, confidence (0-100), details (optional object)
export default function ResultInterpretation({ label = "No result", confidence = 0, details = null }) {
  // normalize confidence to a finite number
  let conf = Number(confidence);
  if (!Number.isFinite(conf)) conf = 0;

  // Determine healthy status. Allow label to indicate healthy even if `details` is null.
  const labelStr = String(label || "");
  const detailsObj = details || {};

  const isHealthy = Boolean(
    /healthy/i.test(labelStr) ||
      (detailsObj.health_status && /healthy/i.test(String(detailsObj.health_status))) ||
      (detailsObj.plant_name && !(detailsObj.symptoms && detailsObj.symptoms.length))
  );

  const statusLabel = isHealthy ? "Healthy" : "Detected";
  const badgeTextClass = isHealthy ? "text-green-700" : "text-red-700";
  const badgeBgClass = isHealthy ? "bg-green-50" : "bg-red-50";

  let progressColorClass = "bg-green-600";
  if (isHealthy) {
    if (conf >= 80) progressColorClass = "bg-green-600";
    else if (conf >= 50) progressColorClass = "bg-yellow-500";
    else progressColorClass = "bg-red-500";
  } else {
    if (conf >= 75) progressColorClass = "bg-green-600";
    else if (conf >= 50) progressColorClass = "bg-yellow-500";
    else progressColorClass = "bg-red-500";
  }

  // interpretation text
  let interpretation = "";
  if (isHealthy) {
    if (conf >= 80) interpretation = "Likely healthy.";
    else if (conf >= 50) interpretation = "Possibly healthy — verify visually.";
    else interpretation = "Uncertain — retake a clearer photo.";
  } else {
    if (conf >= 75) interpretation = "High confidence detection — follow recommended treatment.";
    else if (conf >= 50) interpretation = "Likely detection — consider rechecking or seeking confirmation.";
    else interpretation = "Low confidence — retake photo for a better result.";
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-md shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        </div>
        <div className={`text-xs ${badgeTextClass} ${badgeBgClass} px-2 py-1 rounded-full`}>{statusLabel}</div>
      </div>

      <div className="mt-3">
        <div className="text-sm text-gray-500">Confidence: <span className="font-medium">{conf}%</span></div>
        <div className="mt-2 w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className={`h-full rounded-full ${progressColorClass}`} style={{ width: `${Math.min(Math.max(conf, 0), 100)}%` }} />
        </div>
        <div className="mt-2 text-sm text-gray-600">{interpretation}</div>
      </div>
    </div>
  );
}
