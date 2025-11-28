// src/pages/Report.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import resolveImagePath from "../utils/imageResolver"; // optional, handle if not present

const SESSION_KEY = "plantcare_history_session";

// small helpers
const joinOr = (arr, fallback) =>
  Array.isArray(arr)
    ? arr.length
      ? arr.join(", ")
      : fallback || "Various plants"
    : arr
    ? String(arr)
    : fallback || "Various plants";

const confidencePercent = (c) => {
  if (c == null) return "—";
  if (c > 1) return Math.round(c);
  return Math.round(c * 100);
};

const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toISOString().split("T")[0];
};

// inference helpers (fallbacks when dataset is minimal)
const inferDescription = (item) => {
  if (!item) return "No details available.";
  if (item.details?.description) return item.details.description;
  if (item.summary) return item.summary;
  const symptoms = item.details?.symptoms || item.symptoms || [];
  if (symptoms.length) return `Common symptoms include: ${symptoms.slice(0, 4).join(", ")}.`;
  if (item.label) return `${item.label} — limited details available.`;
  return "Detailed description not available.";
};

const inferCauses = (item) => {
  const label = (item?.label || "").toLowerCase();
  if (/mildew|powdery|downy|blight|rust|spot|rot|anthracnose/.test(label)) {
    return [
      "Fungal or oomycete pathogen (common for leaf spots, mildews, rots).",
      "Favours humid, wet conditions and poor air circulation.",
      "Spores persist on debris and can splash between plants.",
    ];
  }
  if (/virus|mosaic|mottling/.test(label)) {
    return [
      "Viral infection often spread by insect vectors (aphids, thrips).",
      "Can be transmitted via contaminated tools and nursery stock.",
    ];
  }
  if (/nutrient|deficiency/.test(label)) {
    return ["Soil nutrient imbalance or pH issues.", "Incorrect fertilization or poor root uptake."];
  }
  return ["Cause information not available from data. Consider lab testing or expert diagnosis."];
};

const inferPrevention = (item) => {
  const label = (item?.label || "").toLowerCase();
  const base = [
    "Practice good garden sanitation — remove infected debris.",
    "Improve air circulation and avoid overhead irrigation.",
    "Rotate crops and avoid planting susceptible species in the same spot.",
  ];
  if (/powdery|mildew|downy|blight|spot|rust|anthracnose/.test(label)) {
    base.unshift("Use disease-resistant varieties when available.");
    base.push("Apply fungicides labeled for the disease when necessary, following label directions.");
  }
  if (/virus/.test(label)) {
    base.push("Control insect vectors and use virus-free planting material.");
  }
  return base;
};

const inferTreatment = (item) => {
  if (item?.details?.treatment && item.details.treatment.length) return item.details.treatment;
  const label = (item?.label || "").toLowerCase();
  if (/powdery|mildew|downy|blight|rust|spot|anthracnose|rot/.test(label)) {
    return [
      "Remove and destroy heavily infected tissue; do not compost.",
      "Prune to increase airflow and reduce humidity.",
      "Apply a targeted fungicide if disease is severe (follow label).",
    ];
  }
  if (/virus|mosaic/.test(label)) {
    return ["No cure for viral infections; remove infected plants and control vectors."];
  }
  return ["No specific treatment available in dataset; consult extension services or plant pathologist."];
};

// search session array for an item by id-like fields
function findInSessionById(seekId) {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) ?? "[]";
    const arr = JSON.parse(raw || "[]");
    if (!arr || !arr.length) return null;
    return arr.find((r) => {
      const rid = r._id || r.id || r.label || r.name || r.title;
      if (!rid) return false;
      return rid === seekId || rid === decodeURIComponent(seekId) || encodeURIComponent(rid) === seekId;
    }) || null;
  } catch (err) {
    console.error("findInSessionById error", err);
    return null;
  }
}

export default function Report({ item: propItem }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // prefer location.state.item when navigated from History
  const stateItem = location?.state?.item ?? null;

  // try last_report fallback
  let lastReport = null;
  try {
    const rawLast = sessionStorage.getItem("last_report");
    if (rawLast) lastReport = JSON.parse(rawLast);
  } catch {
  console.error("Failed to parse last_report from sessionStorage");
}


  // try session search by id if nothing else
  let foundById = null;
  if (!propItem && !stateItem && !lastReport && id) {
    foundById = findInSessionById(id);
  }

  const initialItem = propItem || stateItem || lastReport || foundById || null;
  const [item, setItem] = useState(initialItem);
  const [saved, setSaved] = useState(false);

  // attempt one more load on mount if item still missing but id exists
  useEffect(() => {
    if (item) return;
    if (!id) return;
    const candidate = findInSessionById(id);
    if (candidate) setItem(candidate);
  }, [id, item]);

  // persist last_report when item loaded (helps refresh/direct URL)
  useEffect(() => {
    if (!item) return;
    try {
      sessionStorage.setItem("last_report", JSON.stringify(item));
    } catch {
  console.error("Failed to parse last_report from sessionStorage");
}

  }, [item]);

  // computed fields & fallbacks
  const title = useMemo(() => item?.label || item?.name || "Unknown disease", [item]);

  const image = useMemo(() => {
    try {
      return typeof resolveImagePath === "function"
        ? resolveImagePath(item?.image || item?.image_url)
        : item?.image || item?.image_url;
    } catch {
      return item?.image || item?.image_url;
    }
  }, [item]);

  const plantsStr = useMemo(() => joinOr(item?.plants || item?.plant_list || item?.plant || [], "Various plants"), [item]);
  const confidence = useMemo(() => (item ? confidencePercent(item.confidence) : "—"), [item]);
  const severity = useMemo(() => item?.severity || item?.severity_level || item?.details?.severity || "Unknown", [item]);
  const description = useMemo(() => inferDescription(item), [item]);

  const symptoms = useMemo(() => item?.details?.symptoms || item?.symptoms || [], [item]);
  const causes = useMemo(() => inferCauses(item), [item]);
  const prevention = useMemo(() => inferPrevention(item), [item]);
  const treatment = useMemo(() => inferTreatment(item), [item]);

  const related = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem("plantcare_history") ?? "[]";
      const arr = JSON.parse(raw || "[]");
      if (!item) return arr.slice(0, 4);
      return arr.filter((r) => (r.label || r.name) !== item.label).slice(0, 4);
    } catch {
      return [];
    }
  }, [item]);

  const handleSaveToSession = () => {
    if (!item) return;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) ?? "[]";
      const arr = JSON.parse(raw || "[]");
      const idKey = item._id || item.id || item.label || item.name || item.title;
      if (!arr.find((p) => (p._id || p.id || p.label || p.name || p.title) === idKey)) {
        arr.unshift({ ...item, saved_at: new Date().toISOString() });
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(arr.slice(0, 50)));
        window.dispatchEvent(new Event("plantcare:history_updated"));
      }
      setSaved(true);
    } catch (e) {
      console.error("Failed to save:", e);
    }
  };

  if (!item) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold">Report not found</h2>
          <p className="text-gray-500 mt-2">We couldn't locate the requested report. Try saving a scan first or check session/local storage.</p>
          <div className="mt-4">
            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-green-600 text-white rounded">Back</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- PRESENTABLE RETURN (matches your reference) ----------
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* HERO / HEADER */}
        <div className="relative h-48 md:h-72">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/placeholder.jpg";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
              No image available
            </div>
          )}

          {/* subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/28 to-transparent pointer-events-none" />

          {/* title/meta */}
          <div className="absolute left-6 bottom-6 text-white">
            <h1 className="text-2xl md:text-3xl font-extrabold drop-shadow-lg">{title}</h1>
            <div className="mt-1 text-sm text-white/90">
              <span className="block">Plants: <span className="font-medium">{plantsStr}</span></span>
            </div>
          </div>

          {/* actions */}
          <div className="absolute right-6 top-6 flex gap-2">
            <button
              onClick={handleSaveToSession}
              className={`px-3 py-2 rounded-md text-sm shadow-sm border ${saved ? "bg-white text-gray-700" : "bg-emerald-600 text-white"}`}
            >
              {saved ? "Saved" : "Save to History"}
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-md text-sm bg-white text-gray-800 border shadow-sm"
            >
              Print
            </button>
          </div>
        </div>

        {/* body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About + key stats */}
            <div className="bg-white rounded-lg border p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">About {title}</h3>
                  <p className="text-gray-600 mt-2">{description}</p>
                </div>

                <div className="flex gap-3">
                  <div className="bg-emerald-50 border rounded-lg px-4 py-3 text-center">
                    <div className="text-xs text-gray-500">Confidence</div>
                    <div className="text-lg font-semibold text-emerald-700">{confidence}%</div>
                  </div>
                  <div className="bg-yellow-50 border rounded-lg px-4 py-3 text-center">
                    <div className="text-xs text-gray-500">Severity</div>
                    <div className="text-lg font-semibold text-yellow-700">{severity}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Symptoms */}
            <section>
              <h4 className="text-lg font-semibold mb-4">Common Symptoms</h4>
              {symptoms.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {symptoms.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-white border rounded-lg shadow-sm">
                      <div className="flex-none w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 12s4-8 8-8 8 8 8 8-4 8-8 8-8-8-8-8z" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-700">{s}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No symptom list available</div>
              )}
            </section>

            {/* Causes + Prevention */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <h5 className="font-semibold mb-3">What Causes {title.split("(")[0].trim()}?</h5>
                <div className="space-y-3 text-sm text-gray-700">
                  {causes.map((c, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-emerald-50 rounded-md flex items-center justify-center text-emerald-600">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="1.5" d="M12 2v20" />
                        </svg>
                      </div>
                      <div>{c}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <h5 className="font-semibold mb-3">Prevention Methods</h5>
                <div className="space-y-3 text-sm text-gray-700">
                  {prevention.map((p, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center text-blue-600">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="1.5" d="M5 12h14" />
                        </svg>
                      </div>
                      <div>{p}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Treatment */}
            <section>
              <h4 className="text-lg font-semibold mb-3">Treatment & Management</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {treatment.map((t, i) => (
                  <div key={i} className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-md flex items-center justify-center">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="1.5" d="M3 12h18" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-700">{t}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* right column */}
          <aside className="space-y-4">
            <div className="p-4 border rounded-lg bg-gray-50 shadow-sm sticky top-6">
              <h5 className="font-semibold text-gray-700">Key Statistics</h5>
              <div className="mt-3 text-sm text-gray-700 space-y-2">
                <div className="flex justify-between">
                  <span>Confidence</span>
                  <strong className="text-emerald-700">{confidence}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Severity</span>
                  <strong className="text-yellow-700">{severity}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Detected on</span>
                  <strong>{formatDate(item.saved_at || item.date || item.scanned_at)}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-white shadow-sm">
              <h5 className="font-semibold text-gray-700">Quick Actions</h5>
              <div className="mt-3 flex flex-col gap-2">
                <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="px-3 py-2 bg-emerald-600 text-white rounded-md">Copy report link</button>
                <button onClick={() => window.print()} className="px-3 py-2 border rounded-md">Export / Print</button>
                <button onClick={() => navigate("/history")} className="px-3 py-2 border rounded-md">View Session History</button>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-white shadow-sm">
              <h5 className="font-semibold text-gray-700">Related Conditions</h5>
              <div className="mt-3 flex flex-col gap-3">
                {related.length ? (
                  related.slice(0, 3).map((r, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img src={typeof resolveImagePath === "function" ? resolveImagePath(r.image) : (r.image || r.image_url || "/images/placeholder.jpg")} onError={(e) => { e.target.onerror = null; e.target.src = "/images/placeholder.jpg"; }} alt={r.label} className="w-14 h-10 object-cover rounded" />
                      <div className="text-sm">
                        <div className="font-medium text-gray-800">{r.label || r.name}</div>
                        <div className="text-xs text-gray-500">{joinOr(r.plants || r.plant || [], "")}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No related conditions found</div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
