import React from 'react';
import resolveImagePath from '../utils/imageResolver';

const formatPlants = (plants) => {
  if (!plants) return "Various Plants";
  if (Array.isArray(plants)) return plants.join(", ");
  return plants;
};

const DetailDrawer = ({ open, item, onClose }) => {
  if (!open || !item) return null;
  const img = resolveImagePath(item.image || item.image_url || item.image_url_raw);
  const plants = formatPlants(item.plants || item.plant_list || item.plants_affected);
  const severity = item.severity || item.severity_level || 'Low';

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="w-full md:w-1/2 lg:w-1/3 bg-white shadow-xl p-6 overflow-auto">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold">{item.name || item.title}</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <img src={img} alt={item.name || item.title} className="w-full h-56 object-cover mt-4 rounded" onError={(e) => (e.target.src = '/images/placeholder.jpg')} />

        <div className="mt-4">
          <p className="text-gray-700">Plants: <span className="text-green-700">{plants}</span></p>
          <p className="text-gray-700 mt-1">Severity: <strong>{severity}</strong></p>

          <div className="mt-4 text-gray-700">
            <h4 className="font-semibold">Description</h4>
            <p className="mt-2">{item.description || item.long_description || item.details || item.summary || 'Detailed description not available.'}</p>
          </div>

          <div className="mt-4 text-gray-700">
            <h4 className="font-semibold">Management & Prevention</h4>
            <p className="mt-2">{item.management || item.treatment || 'No specific management steps provided in this record.'}</p>
          </div>
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};

export default DetailDrawer;