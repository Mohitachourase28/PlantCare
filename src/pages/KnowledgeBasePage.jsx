/* eslint-disable no-unused-vars */ 
import React, { useState, useMemo, useEffect } from "react";
import PREDICTIONS from "../data/predictions.json";
import resolveImagePath from "../utils/imageResolver";
import DiseaseCard from "../components/DiseaseCard";

// --- Small Helpers ---
const formatPlants = (plants) => {
  if (!plants) return "Various Plants";
  if (Array.isArray(plants)) return plants.join(", ");
  return plants;
};

const severityStyles = {
  Low: "bg-green-50 text-green-700",
  Moderate: "bg-yellow-50 text-yellow-700",
  High: "bg-orange-50 text-orange-700",
  Severe: "bg-red-50 text-red-700",
};

const confidenceStyles = {
  Healthy: "bg-green-50 text-green-700",
  Mild: "bg-yellow-50 text-yellow-700",
  Moderate: "bg-orange-50 text-orange-700",
  Severe: "bg-red-50 text-red-700",
  Unknown: "bg-gray-50 text-gray-500",
};

// Map numeric confidence to labels
const getConfidenceLabel = (confidence) => {
  if (confidence == null) return "Unknown";
  if (confidence >= 0.8) return "Healthy";
  if (confidence >= 0.6) return "Mild";
  if (confidence >= 0.4) return "Moderate";
  return "Severe";
};

// --- Search + Filters component ---
const SearchFilters = ({
  query,
  setQuery,
  filters,
  setFilters,
  plantOptions = [],
  categoryOptions = [],
  severityOptions = [],
  confidenceOptions = [],
  onClear
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by plant or disease name"
              className="w-full rounded-full border px-5 py-3 text-sm placeholder-gray-400 focus:outline-none"
            />
          </div>

          <select
            value={filters.plantType || 'All'}
            onChange={(e) => setFilters((s) => ({ ...s, plantType: e.target.value }))}
            className="px-3 py-1 bg-white border rounded-full text-sm"
          >
            <option value="All">All Plants</option>
            {plantOptions.map((p) => (
              <option value={p} key={p}>{p}</option>
            ))}
          </select>

          <select
            value={filters.category || 'All'}
            onChange={(e) => setFilters((s) => ({ ...s, category: e.target.value }))}
            className="px-3 py-1 bg-white border rounded-full text-sm"
          >
            <option value="All">All Categories</option>
            {categoryOptions.map((c) => (
              <option value={c} key={c}>{c}</option>
            ))}
          </select>

          <select
            value={filters.severity || 'All'}
            onChange={(e) => setFilters((s) => ({ ...s, severity: e.target.value }))}
            className="px-3 py-1 bg-white border rounded-full text-sm"
          >
            <option value="All">All Severities</option>
            {severityOptions.map((s) => (
              <option value={s} key={s}>{s}</option>
            ))}
          </select>

          <select
            value={filters.confidence || 'All'}
            onChange={(e) => setFilters((s) => ({ ...s, confidence: e.target.value }))}
            className="px-3 py-1 bg-white border rounded-full text-sm"
          >
            <option value="All">All Health Levels</option>
            {confidenceOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button onClick={onClear} className="text-green-600 underline text-sm ml-auto">Clear Filters</button>
        </div>
      </div>
    </div>
  );
};

// --- Step / Pagination Indicator ---
const StepIndicator = ({ page, setPage, total = 1 }) => {
  const pages = Array.from({ length: Math.max(1, total) }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${page === p ? "bg-green-600 text-white" : "bg-white border text-gray-600"}`}>
          {p}
        </button>
      ))}
    </div>
  );
};

// --- Detail Drawer ---
const DetailDrawer = ({ open, item, onClose }) => {
  if (!open || !item) return null;
  const img = resolveImagePath(item.image || item.image_url) || "/images/placeholder.jpg";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="w-full md:w-1/2 lg:w-1/3 bg-white shadow-xl p-6 overflow-auto">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold">{item.name}</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <img src={img} alt={item.name} className="w-full h-56 object-cover mt-4 rounded" onError={(e)=>{e.currentTarget.src='/images/placeholder.jpg'}} />

        <div className="mt-4">
          <p className="text-gray-700">Plants: <span className="text-green-700">{formatPlants(item.plants)}</span></p>
          <p className="text-gray-700 mt-1">Severity: <span className={`inline-block px-2 py-0.5 rounded-full ${severityStyles[item.severity] || 'bg-green-50 text-green-700'}`}>{item.severity}</span></p>
          <p className="text-gray-700 mt-1">Health: <span className={`inline-block px-2 py-0.5 rounded-full ${confidenceStyles[getConfidenceLabel(item.confidence)]}`}>{getConfidenceLabel(item.confidence)}</span></p>

          <div className="mt-4 text-gray-700">
            <h4 className="font-semibold">Description</h4>
            <p className="mt-2">{item.description || 'Detailed description not available.'}</p>
          </div>

          <div className="mt-4 text-gray-700">
            <h4 className="font-semibold">Management & Prevention</h4>
            <p className="mt-2">{item.management || item.treatment || 'No specific management steps provided.'}</p>
          </div>
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};

// --- Main Page ---
export default function KnowledgeBasePage() {
  const [pageView, setPageView] = useState("home");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const [filters, setFilters] = useState({ plantType: "All", category: "All", severity: "All", confidence: "All" });

  const storageKey = "plantCare_history";
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // normalize incoming data
  const data = useMemo(() => {
    const src = (PREDICTIONS && PREDICTIONS.diseases) || (Array.isArray(PREDICTIONS) ? PREDICTIONS : []);
    return src.map((d, idx) => ({
      ...d,
      id: d.id ?? d._id ?? `pred-${idx}`,
      name: d.label || d.name || d.title || d.id || `Disease ${idx + 1}`,
      image: resolveImagePath(d.image) || d.image_url || d.image_url_local || null,
      plants: d.plants || d.plant || d.details?.plant_name || d.plant_list || "",
      short_description: d.short_description || (d.details?.symptoms ? d.details.symptoms[0] : ""),
      description: d.details?.description || (d.details?.symptoms ? d.details.symptoms.join(" ") : d.description || ""),
      confidence: d.confidence != null ? d.confidence : null,
      severity: d.severity || d.details?.severity || "Low",
      category: d.category || d.details?.category || "General",
    }));
  }, []);

  const plantOptions = useMemo(() => {
    const s = new Set();
    data.forEach((d) => {
      if (!d.plants) return;
      if (Array.isArray(d.plants)) d.plants.forEach((p) => s.add(p));
      else d.plants.split(",").map(p => p.trim()).filter(Boolean).forEach(p => s.add(p));
    });
    return Array.from(s).slice(0, 50);
  }, [data]);

  const categoryOptions = useMemo(() => Array.from(new Set(data.map(d => d.category || "General"))).slice(0,50), [data]);
  const severityOptions = ["Low","Moderate","High","Severe"];
  const confidenceOptions = ["Healthy","Mild","Moderate","Severe"];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((d) => {
      if (filters.plantType && filters.plantType !== "All") {
        const plantsText = Array.isArray(d.plants) ? d.plants.join(" ") : (d.plants || "");
        if (!plantsText.toLowerCase().includes(filters.plantType.toLowerCase())) return false;
      }
      if (filters.category && filters.category !== "All" && (d.category || "General") !== filters.category) return false;
      if (filters.severity && filters.severity !== "All" && (d.severity || "Low") !== filters.severity) return false;
      if (filters.confidence && filters.confidence !== "All") {
        const label = getConfidenceLabel(d.confidence);
        if (label !== filters.confidence) return false;
      }

      if (!q) return true;
      const text = [d.name, d.title, d.plants, d.description, d.short_description, d.summary, d.label, d.category].join(" ") || "";
      return text.toLowerCase().includes(q);
    });
  }, [data, query, filters]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history || []));
    } catch {
      // ignore
    }
  }, [history]);

  const openItem = (item) => setSelected(item);
  const bookmarkItem = (item) => {
    setHistory((prev) => {
      const id = item._id || item.id || item.name || item.title || item.label;
      const exists = prev.find((p) => (p._id || p.id || p.name || p.title || p.label) === id);
      if (exists) return prev;
      const next = [item, ...prev].slice(0, 50);
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(storageKey); } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <main>
        {pageView === 'home' && (
          <section className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 gap-6">
              <SearchFilters
                query={query}
                setQuery={setQuery}
                filters={filters}
                setFilters={setFilters}
                plantOptions={plantOptions}
                categoryOptions={categoryOptions}
                severityOptions={severityOptions}
                confidenceOptions={confidenceOptions}
                onClear={() => setFilters({ plantType: "All", category: "All", severity: "All", confidence: "All" })}
              />

              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {filtered.map((p) => (
                    <DiseaseCard key={p._id || p.id || p.name || p.title || p.label} item={p} onOpen={openItem} onBookmark={bookmarkItem} />
                  ))}
                </div>

                <StepIndicator page={page} setPage={setPage} total={Math.ceil(filtered.length / pageSize)} />
              </div>
            </div>
          </section>
        )}

        {pageView === 'history' && (
          <section className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-2xl font-semibold text-gray-800">History</h2>
            <p className="text-gray-500 mt-1">Saved items you've viewed during this session.</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {history.length === 0 ? (
                <div className="p-6 bg-white rounded-xl border text-gray-500">No history yet — open an item and click the bookmark icon to save it.</div>
              ) : (
                history.map((h) => (
                  <div key={h._id || h.id || h.name || h.title} className="bg-white border rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{h.name || h.title || h.label}</div>
                        <div className="text-sm text-gray-500">{formatPlants(h.plants || h.plant_list)}</div>
                      </div>
                      <div className="text-xs flex flex-col gap-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full ${severityStyles[h.severity] || 'bg-green-50 text-green-700'}`}>{h.severity || h.severity_level || 'Low'}</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full ${confidenceStyles[getConfidenceLabel(h.confidence)]}`}>{getConfidenceLabel(h.confidence)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6">
              <button onClick={clearHistory} className="px-3 py-1 bg-red-50 text-red-600 rounded">Clear History</button>
            </div>
          </section>
        )}
      </main>

      <DetailDrawer open={!!selected} item={selected} onClose={() => setSelected(null)} />

      <footer className="border-t bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-gray-500">© PlantCare • Built with React + Tailwind</div>
      </footer>
    </div>
  );
}
