import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// --- helpers ---
const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toISOString().split("T")[0];
};

const csvEscape = (v) =>
  `"${String(v ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`;

const StatusBadge = ({ status }) => {
  const map = {
    Healthy: "bg-green-50 text-green-700",
    Monitoring: "bg-yellow-50 text-yellow-800",
    "Treatment Needed": "bg-red-50 text-red-700",
    Default: "bg-gray-50 text-gray-700",
  };
  const cls = map[status] || map.Default;
  return (
    <span className={`px-3 py-1 rounded-full text-sm ${cls}`}>{status}</span>
  );
};

const SESSION_KEY = "plantcare_history_session";

// Deterministic status computation (keeps previous heuristics)
const computeStatus = (p) => {
  if (!p) return "Monitoring";

  if (p.status && typeof p.status === "string") return p.status;

  const label = (p.label || p.name || p.title || "").toString();
  const healthText = (p.details?.health_status || "").toString();
  if (/healthy/i.test(label) || /healthy/i.test(healthText)) return "Healthy";

  const confRaw = Number.isFinite(p.confidence)
    ? Number(p.confidence)
    : p.confidence_percent != null
    ? p.confidence_percent / 100
    : 0;
  const conf = confRaw > 1 ? confRaw / 100 : confRaw;

  const sev = (p.severity || p.severity_level || p.details?.severity || "")
    .toString()
    .toLowerCase();

  const TREATMENT_THRESHOLD = 0.9;
  const MONITOR_THRESHOLD = 0.7;

  if (/severe|high/.test(sev)) {
    if (conf >= 0.5) return "Treatment Needed";
    return "Monitoring";
  }

  if (conf >= TREATMENT_THRESHOLD) return "Treatment Needed";
  if (conf >= MONITOR_THRESHOLD) return "Monitoring";

  return "Monitoring";
};

// --- new helper to derive plant name(s) ---
const titleCase = (s = "") =>
  s
    .toString()
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");

const derivePlants = (p = {}) => {
  if (!p) return "Various";

  // 1) Prefer explicit fields commonly used
  if (Array.isArray(p.plants) && p.plants.length) {
    return p.plants.map((x) => titleCase(x)).join(", ");
  }
  if (p.plants && String(p.plants).trim()) {
    return titleCase(String(p.plants));
  }
  if (p.plant && String(p.plant).trim()) {
    return titleCase(String(p.plant));
  }

  // 2) Many items use 'id' as the plant name
  if (p.id && typeof p.id === "string" && p.id.trim()) {
    return titleCase(p.id);
  }

  // 3) Structured details fields
  const fromDetails =
    p.details?.plant ||
    p.details?.crop ||
    p.details?.species ||
    p.details?.host ||
    p.details?.plant_name;
  if (fromDetails && String(fromDetails).trim()) {
    return titleCase(String(fromDetails));
  }

  // 4) Search common free-text fields
  const textSources = [
    p.description,
    p.details?.description,
    p.details?.notes,
    p.label,
    p.name,
    p.title,
    p.raw_description || p.description,
  ]
    .filter(Boolean)
    .map(String)
    .join(" | ");

  if (textSources) {
    // Pattern: "... on <Plant>"
    const onMatch = textSources.match(/\bon\s+(the\s+)?([A-Za-z][A-Za-z\s'()-]{0,60})/i);
    if (onMatch && onMatch[2]) {
      const candidate = onMatch[2]
        .replace(/\b(leaf|leaves|plant|tree|flower|fruit|foliage)\b/i, "")
        .trim();
      if (candidate) return titleCase(candidate.split(",")[0]);
    }

    // Pattern: "Maple Leaf: Powdery Mildew"
    const colonMatch = textSources.match(/^([A-Za-z][A-Za-z\s'()-]{0,60})\s*:/);
    if (colonMatch && colonMatch[1]) {
      const cand = colonMatch[1].replace(/\b(leaf|plant)\b/i, "").trim();
      if (cand) return titleCase(cand);
    }

    // Pattern: "Disease - Tomato"
    const dashMatch = textSources.match(/[-–—]\s*([A-Za-z][A-Za-z\s'()-]{0,60})/);
    if (dashMatch && dashMatch[1]) {
      const cand = dashMatch[1].replace(/\b(leaf|plant)\b/i, "").trim();
      if (cand) return titleCase(cand);
    }

    // Pick likely capitalized sequence
    const capsMatch = textSources.match(/([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,}){0,2})/);
    if (capsMatch && capsMatch[1]) {
      return titleCase(capsMatch[1].replace(/\b(leaf|plant|tree)\b/i, "").trim());
    }

    // Look for common plant names as last resort
    const commonPlants = ["tomato", "rose", "cucumber", "sunflower", "maple", "potato", "pepper"];
    const lower = textSources.toLowerCase();
    for (const cp of commonPlants) {
      if (lower.includes(cp)) return titleCase(cp);
    }
  }

  // final fallback
  return "Various";
};

export default function History() {
  const navigate = useNavigate();

  // initialize state from sessionStorage (fallback: attempt migration from localStorage once)
  const [items, setItems] = useState(() => {
    try {
      // prefer sessionStorage
      const rawSession = sessionStorage.getItem(SESSION_KEY);
      const raw = rawSession ?? localStorage.getItem("plantcare_history") ?? "[]";
      const parsed = JSON.parse(raw || "[]");

      const normalized = parsed.map((p, i) => {
        const id = p._id || p.id || p.label || p.name || `h-${i}`;

        // Defensive label: avoid using a "status" string as the disease label
        const rawLabel = (p.label || p.name || p.title || p.disease || "").toString();
        const isStatusLike = /^(healthy|monitoring|treatment needed|treatment|unknown)$/i.test(rawLabel.trim());
        const label =
          !rawLabel || isStatusLike
            ? p.details?.disease || p.disease || p.name || p.title || "Unknown"
            : rawLabel;

        // compute status: prefer explicit saved status, otherwise fall back to heuristic
        const status = p.status || computeStatus(p);

        // derive plants using helper
        const plants = derivePlants(p);

        const date = p.date || p.scanned_at || p.created_at || new Date().toISOString();
        const confidence =
          p.confidence != null
            ? p.confidence
            : p.confidence_percent != null
            ? p.confidence_percent / 100
            : null;

        const severity = p.severity || p.severity_level || p.details?.severity || "";

        return {
          id,
          label,
          plants,
          date,
          confidence,
          severity,
          status,
          image: p.image || p.image_url || null,
          raw: p,
        };
      });

      normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
      return normalized;
    } catch (err) {
      console.error("Failed to load session history:", err);
      return [];
    }
  });

  // function that reloads items from sessionStorage (reuse your existing normalization logic)
  const reloadFromSession = () => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) ?? "[]";
      const parsed = JSON.parse(raw || "[]");
      const normalized = parsed.map((p, i) => {
        const id = p._id || p.id || p.label || p.name || `h-${i}`;

        const rawLabel = (p.label || p.name || p.title || p.disease || "").toString();
        const isStatusLike = /^(healthy|monitoring|treatment needed|treatment|unknown)$/i.test(rawLabel.trim());
        const label =
          !rawLabel || isStatusLike
            ? p.details?.disease || p.disease || p.name || p.title || "Unknown"
            : rawLabel;

        const status = p.status || computeStatus(p);

        // derive plants using helper
        const plants = derivePlants(p);

        const date = p.date || p.scanned_at || p.created_at || new Date().toISOString();
        const confidence =
          p.confidence != null
            ? p.confidence
            : p.confidence_percent != null
            ? p.confidence_percent / 100
            : null;
        const severity = p.severity || p.severity_level || p.details?.severity || "";
        return {
          id,
          label,
          plants,
          date,
          confidence,
          severity,
          status,
          image: p.image || p.image_url || null,
          raw: p,
        };
      });
      normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(normalized);
    } catch (e) {
      console.error("Failed to reload session history:", e);
    }
  };

  // add this effect so History refreshes on the custom event and also when other tabs change storage
  useEffect(() => {
    // reload once on mount (optional if you already do)
    reloadFromSession();

    const onUpdated = () => reloadFromSession();
    const onStorage = (ev) => {
      // fallback: if another tab changed storage we also reload (ev.key may be null for sessionStorage changes depending on browser)
      if (!ev.key || ev.key === SESSION_KEY) reloadFromSession();
    };

    window.addEventListener("plantcare:history_updated", onUpdated);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("plantcare:history_updated", onUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []); // empty deps so it registers once

  // UI state
  const [query, setQuery] = useState("");
  const [plantFilter, setPlantFilter] = useState("All");
  const [exporting, setExporting] = useState(false);

  // filter options
  const plantOptions = useMemo(() => {
    const set = new Set();
    items.forEach((it) => {
      (it.plants || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => set.add(s));
    });
    return ["All", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (plantFilter !== "All" && !it.plants.toLowerCase().includes(plantFilter.toLowerCase()))
        return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        it.label.toLowerCase().includes(q) ||
        it.plants.toLowerCase().includes(q) ||
        (it.status || "").toLowerCase().includes(q) ||
        (it.severity || "").toLowerCase().includes(q)
      );
    });
  }, [items, query, plantFilter]);

  const totalScans = items.length;

  const plantsMonitored = useMemo(() => {
    const set = new Set();
    items.forEach((it) =>
      (it.plants || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => set.add(s))
    );
    return set.size;
  }, [items]);

  const activeTreatments = useMemo(
    () =>
      items.filter((it) => /treatment|monitoring/i.test(it.status) && !/healthy/i.test(it.status)).length,
    [items]
  );

  const distribution = useMemo(() => {
    const map = new Map();
    items.forEach((it) => {
      const key = it.label || "Unknown";
      map.set(key, (map.get(key) || 0) + 1);
    });
    const arr = Array.from(map.entries()).map(([label, count]) => ({
      label,
      count,
    }));
    arr.sort((a, b) => b.count - a.count);
    const top = arr.slice(0, 4);
    const others = arr.slice(4).reduce((s, v) => s + v.count, 0);
    if (others > 0) top.push({ label: "Other", count: others });
    const total = top.reduce((s, v) => s + v.count, 0) || 1;
    return { slices: top, total };
  }, [items]);

  function statusLabelToBadge(status) {
    if (/Healthy/i.test(status)) return "bg-green-50 text-green-700";
    if (/Treatment Needed/i.test(status)) return "bg-red-50 text-red-700";
    return "bg-yellow-50 text-yellow-800"; // Monitoring / unknown
  }

  const mostScannedPlant = useMemo(() => {
    const map = new Map();
    items.forEach((it) => {
      (it.plants || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((p) => map.set(p, (map.get(p) || 0) + 1));
    });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { plant: sorted[0][0], count: sorted[0][1] } : { plant: "—", count: 0 };
  }, [items]);

  const commonIssue = useMemo(() => {
    const map = new Map();
    items.forEach((it) => map.set(it.label, (map.get(it.label) || 0) + 1));
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { issue: sorted[0][0], count: sorted[0][1] } : { issue: "—", count: 0 };
  }, [items]);

  const treatmentSuccessRate = useMemo(() => {
    const treated = items.filter((it) => /treatment/i.test(it.status) || /treatment/i.test(it.label));
    if (!treated.length) return 92;
    const success = treated.filter((t) => /success|healthy|resolved/i.test(t.status)).length;
    return Math.round((success / treated.length) * 100);
  }, [items]);

  // export CSV of session items
  const handleExport = () => {
    setExporting(true);
    try {
      const header = ["id", "label", "plants", "date", "status", "confidence"];
      const rows = items.map((it) =>
        header.map((h) => csvEscape(it[h] ?? (it.raw && it.raw[h]) ?? "")).join(",")
      );
      const csv = [header.map(csvEscape).join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plantcare_history_session_${formatDate(new Date())}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  };

  // COLORS for donut
  const DONUT_COLORS = ["#34D399", "#FBBF24", "#F87171", "#F472B6", "#C7D2FE"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-3">
              <span className="text-green-600">PlantCare</span>
              <span className="text-gray-600 text-base font-medium">Welcome back</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Your recent scans and monitoring overview</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Total Scans</div>
              <div className="text-xl font-semibold text-gray-800">{totalScans}</div>
            </div>
            <div className="text-green-600 text-2xl">📈</div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Plants Monitored</div>
              <div className="text-xl font-semibold text-gray-800">{plantsMonitored}</div>
            </div>
            <div className="text-green-600 text-2xl">🌱</div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Active Treatments</div>
              <div className="text-xl font-semibold text-gray-800">{activeTreatments}</div>
            </div>
            <div className="text-green-600 text-2xl">💊</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Donut card (fixed) */}
          <div className="bg-white rounded p-4 shadow-sm col-span-1 lg:col-span-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Disease Distribution</h3>
            </div>

            {/* force content area to grow and set same height for both cards */}
            <div className="flex gap-4 items-center flex-1 h-64">
              <div
                style={{
                  width: 200,
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="200" height="200" viewBox="0 0 200 200" role="img" aria-label="Disease distribution">
                  <g transform="translate(100,100)">
                    {(() => {
                      const total = distribution?.total || 1;
                      const slices = distribution?.slices || [];
                      const rOuter = 60;
                      const rStroke = 20;
                      const circumference = 2 * Math.PI * rOuter;
                      let offsetPx = 0;

                      return slices.map((s, idx) => {
                        const portion = (s.count || 0) / total;
                        const dash = Math.max(0, portion * circumference);
                        const strokeDasharray = `${dash} ${Math.max(0, circumference - dash)}`;
                        const strokeDashoffset = -offsetPx;
                        const color = DONUT_COLORS[idx % DONUT_COLORS.length];
                        offsetPx += dash;

                        return (
                          <circle
                            key={s.label || idx}
                            r={rOuter}
                            fill="transparent"
                            stroke={color}
                            strokeWidth={rStroke}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="butt"
                            transform={`rotate(-90)`}
                          />
                        );
                      });
                    })()}

                    <circle r={40} fill="#ffffff" />
                  </g>
                </svg>
              </div>

              <div className="flex-1">
                {distribution.slices.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-2 text-sm mb-2">
                    <span
                      className="w-3 h-3 inline-block rounded"
                      style={{
                        background: DONUT_COLORS[i % DONUT_COLORS.length],
                      }}
                    />
                    <div className="flex-1 text-gray-700">{s.label}</div>
                    <div className="text-gray-500">{s.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar chart card (static dummy) */}
          <div className="bg-white rounded p-4 shadow-sm col-span-1 lg:col-span-1 flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-3">Treatment Timeline</h3>

            {/* Treatment Timeline — improved bar chart (paste in place of old SVG block) */}
            <div style={{ width: "100%", height: 280 }} className="flex-1">
              <svg width="100%" height="100%" viewBox="0 0 100 80" preserveAspectRatio="none" role="img" aria-label="Treatment timeline">
                {(() => {
                  // ⭐ Static values — you can edit them:
                  const source = [
                    { label: "Jan", count: 12 },
                    { label: "Feb", count: 18 },
                    { label: "Mar", count: 14 },
                    { label: "Apr", count: 22 },
                    { label: "May", count: 28 },
                    { label: "Jun", count: 26 },
                  ];

                  const maxValue = Math.max(...source.map((s) => s.count), 1);

                  const ticks = 4;
                  const roughStep = Math.ceil(maxValue / ticks);
                  const roundTo = roughStep <= 5 ? 1 : roughStep <= 10 ? 2 : 5;
                  const tickStep = Math.ceil(roughStep / roundTo) * roundTo;

                  const gridLines = Math.ceil(maxValue / tickStep);
                  const gridMax = gridLines * tickStep;

                  const topPad = 8;
                  const chartHeight = 44;
                  const baselineY = topPad + chartHeight;
                  const labelY = baselineY + 8;

                  const colWidth = 100 / source.length;
                  const barW = Math.max(3, colWidth * 0.45); // thinner bars

                  return (
                    <g>
                      {/* Grid lines & left labels */}
                      {Array.from({ length: gridLines + 1 }).map((_, i) => {
                        const y = topPad + (chartHeight * i) / gridLines;
                        const val = gridMax - i * tickStep;
                        return (
                          <g key={i}>
                            <line x1={8} x2={100} y1={y} y2={y} stroke="#E5E7EB" strokeWidth="0.5" />
                            <text x={1.5} y={y + 2} fontSize="3.2" fill="#9CA3AF">
                              {val}
                            </text>
                          </g>
                        );
                      })}

                      {/* Bars */}
                      {source.map((m, i) => {
                        const colX = i * colWidth + (colWidth - barW) / 2;
                        const h = (m.count / gridMax) * chartHeight;
                        const y = baselineY - h;

                        return (
                          <g key={m.label}>
                            <rect x={colX} y={y} width={barW} height={h} fill="#2DD4BF" />

                            <text x={colX + barW / 2} y={Math.max(2, y - 2)} fontSize="4" fill="#0F172A" textAnchor="middle">
                              {m.count}
                            </text>

                            <text x={colX + barW / 2} y={labelY + 6} fontSize="4.2" fill="#6B7280" textAnchor="middle">
                              {m.label}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/upload")} className="px-4 py-2 bg-green-600 text-white rounded shadow">
            + New Scan
          </button>
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-400 rounded shadow text-gray-700" disabled={exporting}>
            {exporting ? "Exporting..." : "Export Session"}
          </button>
        </div>

        <div className="bg-white rounded p-4 shadow-sm col-span-1 lg:col-span-1 lg:row-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Recent Scans</h3>
            <div className="flex items-center gap-2">
              <input placeholder="Search scans..." className="px-3 py-2 border border-gray-400 rounded text-sm" value={query} onChange={(e) => setQuery(e.target.value)} />
              <select value={plantFilter} onChange={(e) => setPlantFilter(e.target.value)} className="px-3 py-2 border border-gray-400 rounded text-sm">
                {plantOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">Date</th>
                  <th className="py-2">Plant Name</th>
                  <th className="py-2">Disease</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      No scans found
                    </td>
                  </tr>
                ) : (
                  filtered.slice(0, 12).map((it) => (
                    <tr key={it.id} className="border border-gray-200">
                      <td className="py-3 text-gray-600">{formatDate(it.date)}</td>
                      <td className="py-3 font-medium text-gray-800">{it.plants}</td>
                      <td className="py-3 text-gray-700">{it.label}</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${statusLabelToBadge(it.status)}`}>{it.status}</span>
                      </td>

                      <td className="py-3">
                        <button
                          onClick={() => {
                            // store full object so report can load after refresh/direct visit
                            try {
                              sessionStorage.setItem("last_report", JSON.stringify(it.raw || it));
                            } catch (e) {
                              console.error("failed to set last_report", e);
                            }

                            // navigate and also pass state for immediate render
                            navigate(`/report/${encodeURIComponent(it.id)}`, {
                              state: { item: it.raw || it },
                            });
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid mt-3 grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v20" stroke="#059669" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-500">Most Scanned Plant</div>
              <div className="font-semibold text-gray-800">{mostScannedPlant.plant}</div>
              <div className="text-sm text-gray-500">Scanned {mostScannedPlant.count} times this month</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#059669" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-500">Common Issues</div>
              <div className="font-semibold text-gray-800">{commonIssue.issue}</div>
              <div className="text-sm text-gray-500">Most frequent diagnosis</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 12h16" stroke="#059669" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-500">Treatment Success</div>
              <div className="font-semibold text-gray-800">{treatmentSuccessRate}%</div>
              <div className="text-sm text-gray-500">Of treatments completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
