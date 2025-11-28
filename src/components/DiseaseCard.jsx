import React from 'react';

// --- DiseaseCard component (const arrow) ---
// --- Helper: format tags or comma lists nicely ---
const formatPlants = (plants) => {
  if (!plants) return "Various Plants";
  if (Array.isArray(plants)) return plants.join(", ");
  return plants;
};

// --- Severity to styles mapping ---
const severityStyles = {
  Low: "bg-green-100 text-green-800",
  Moderate: "bg-yellow-100 text-yellow-800",
  High: "bg-orange-100 text-orange-800",
  Severe: "bg-red-100 text-red-800",
};

const DiseaseCard = ({ item, onOpen, onBookmark }) => {
  const img = item.image || "/images/placeholder.jpg";
  const plants = formatPlants(item.plants || item.plant_list || item.plants_affected);
  const severity = item.severity || item.severity_level || "Low";

  return (
    <article className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="h-44 bg-gray-100">
        <img src={img} alt={item.name || item.title} className="w-full h-44 object-cover" onError={(e) => (e.target.src = '/images/placeholder.jpg')} />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-800">{item.name || item.title}</h3>
            <p className="text-sm text-green-700 mt-1">{plants}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button onClick={() => onBookmark(item)} title="Save to history" className="p-1 rounded-md hover:bg-gray-100">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5v14l7-5 7 5V5z"/></svg>
            </button>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${severityStyles[severity] || 'bg-green-100 text-green-800'}`}>{severity}</span>
          </div>
        </div>

        <p className="text-gray-600 mt-3 text-sm h-14 overflow-hidden">{item.short_description || item.summary || item.description || 'No short description provided.'}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">{item.confidence ? `Confidence: ${Math.round(item.confidence*100)}%` : ''}</div>
          <button onClick={() => onOpen(item)} className="text-sm text-green-600 font-medium">Read More</button>
        </div>
      </div>
    </article>
  );
};

export default DiseaseCard;