/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import leafSample from "../../assets/image.png";
import predictions from "../../data/predictions.json"; // your disease database
import resolveImagePath from "../../utils/imageResolver";

export default function UploadPage() {
  const [preview, setPreview] = useState(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [diseaseData, setDiseaseData] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const SESSION_KEY = "plantcare_history_session";

  // history state (persisted)
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("plantCare_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("plantcare_history", JSON.stringify(history));
    } catch {
      // ignore storage errors
    }
  }, [history]);

  // ---------------------------
  // UPLOAD + SEND TO BACKEND
  // ---------------------------
  const handleImageUpload = async (file) => {
    setPreview(URL.createObjectURL(file));
    setResultVisible(false);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/compare", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (data && data.success) {
        // Find disease info from JSON using hash
        const match = predictions.diseases.find(
          (d) => d.hash?.toLowerCase() === data.hash?.toLowerCase()
        );

        if (match) {
          const resolved = { ...match, image: resolveImagePath(match.image) };
          setDiseaseData(resolved);
          setConfidence(Math.round((match.confidence || 0) * 100));
        } else {
          // fallback: try to use first item or null
          setDiseaseData(null);
          setConfidence(0);
        }
      } else {
        setDiseaseData(null);
        setConfidence(0);
      }
    } catch (err) {
      console.error("Error calling backend compare endpoint:", err);
      setDiseaseData(null);
      setConfidence(0);
    } finally {
      setResultVisible(true);
    }
  };

  // ---------------------------
  // FILE SELECT HANDLERS
  // ---------------------------
  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setFileName(file.name);
    handleImageUpload(file);
  };

  const onDragOver = (e) => e.preventDefault();

  const onChooseFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    handleImageUpload(file);
  };

  // ---------------------------
  // Save to history (works with local state + localStorage)
  // ---------------------------
const handleSaveHistory = (item) => {
  if (!item) return;

  // normalize id so duplicate detection works
  const id = item._id || item.id || item.label || item.name || item.title;

  try {
    // read existing (session preferred)
    const raw = sessionStorage.getItem(SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    // avoid duplicate by id
    const exists = parsed.find((p) => {
      const pid = p._id || p.id || p.label || p.name || p.title;
      return pid && id && pid === id;
    });

    if (!exists) {
      // determine status coming from backend (do not override later)
      // inside handleSaveHistory(item) before parsed.unshift(...)
const backendStatus =
  item.status ||
  item.details?.health_status ||
  item.label && /^(healthy|monitoring|treatment needed)$/i.test(String(item.label).trim())
    ? item.status || "Unknown"
    : item.label || item.name || item.title || item.description || "Unknown";

const safeLabel =
  (item.label && !/^(healthy|monitoring|treatment needed|treatment|unknown)$/i.test(String(item.label).trim()))
    ? item.label
    : (item.name || item.title || item.description || "Unknown disease");

// final object to save — label is safeLabel, status is backendStatus
const toSave = {
  ...item,
  label: safeLabel,
  status: backendStatus,
  saved_at: new Date().toISOString(),
};


      parsed.unshift(toSave);
      // limit to 50 entries
      const next = parsed.slice(0, 50);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    }

    // notify other parts of the app (History) to reload
    window.dispatchEvent(new Event("plantcare:history_updated"));

    // navigate to history page after saving
    navigate("/history");
  } catch (err) {
    console.error("Failed to save history:", err);
  }
};


  const handleShare = () => alert("Share action (demo)");

  // derive UI states from diseaseData + confidence
  const conf = Number.isFinite(confidence) ? confidence : 0;
  const isHealthy = Boolean(
    diseaseData &&
      ((diseaseData.details &&
        diseaseData.details.health_status &&
        /healthy/i.test(diseaseData.details.health_status)) ||
        /healthy/i.test(diseaseData?.label || "") ||
        (diseaseData.details &&
          diseaseData.details.plant_name &&
          !(
            diseaseData.details.symptoms && diseaseData.details.symptoms.length
          )))
  );

  const statusLabel = isHealthy ? "Healthy" : "Detected";
  const badgeTextClass = isHealthy ? "text-green-700" : "text-red-700";
  const badgeBgClass = isHealthy ? "bg-green-50" : "bg-red-50";

  // progress color logic
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ---------------- MAIN ---------------- */}
      <main className="max-w-6xl mx-auto px-6 py-10 w-full">
        <h1 className="text-4xl md:text-3xl font-semibold text-center text-gray-800">
          Plant Disease Detection
        </h1>
        <p className="text-sm text-gray-500 text-center mt-2">
          Upload your plant photo for instant disease analysis
        </p>

        {/* ---------------- UPLOAD AREA ---------------- */}
        <section className="mt-8 max-w-4xl mx-auto">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg bg-white p-12 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <p className="text-2xl font-bold text-gray-600">
                Drag and drop your image here or click to browse
              </p>
              <p className="text-sm text-gray-400">Supported: JPG, PNG</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onChooseFile}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 font-semibold bg-green-600 text-white rounded-full text-lg shadow"
              >
                Choose File
              </button>
              {fileName && (
                <div className="text-xs text-gray-500 mt-2">
                  Selected: {fileName}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ---------------- RESULT CARD (dynamic) ---------------- */}
        {resultVisible && (
          <section className="mt-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4">
              <div className="md:w-32 w-full flex items-center justify-center">
                <img
                  src={preview || leafSample}
                  alt="uploaded leaf"
                  className="w-32 h-24 object-cover rounded-md shadow-sm"
                />
              </div>

              <div className="flex-1">
                {diseaseData ? (
                  <>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-800">
                        {diseaseData.label}
                      </h3>
                      <span
                        className={`text-xs ${badgeTextClass} ${badgeBgClass} px-2 py-1 rounded-full`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Confidence Level: {confidence}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full ${progressColorClass}`}
                          style={{ width: `${conf}%` }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <h3 className="font-semibold text-red-600">
                    No matching disease found.
                  </h3>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ---------------- INFO CARDS ---------------- */}
        {resultVisible && diseaseData && (
          <section className="mt-8 text-2xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Symptoms */}
            <div className="bg-white rounded-lg shadow p-5">
              <h4 className="font-semibold text-gray-700 mb-2">Symptoms</h4>
              <ul className="text-lg text-gray-600 space-y-2 mb-4">
                {(diseaseData?.details?.symptoms || []).map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>

            {/* Treatment */}
            <div className="bg-white rounded-lg shadow p-5">
              <h4 className="font-semibold text-gray-700 mb-2">Treatment</h4>
              <ul className="text-lg text-gray-600 space-y-2 mb-4">
                {(diseaseData?.details?.treatment || []).map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-lg shadow p-5">
              <h4 className="font-semibold text-gray-700 mb-2">Care Tips</h4>
              <ul className="text-lg text-gray-600 space-y-2 mb-4">
                {(diseaseData?.details?.tips || []).map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ---------------- ACTION BUTTONS ---------------- */}
        <section className="mt-8 max-w-4xl mx-auto flex gap-4 justify-center">
          <button
            onClick={() => handleSaveHistory(diseaseData)}
            className="px-7 py-3 rounded-md bg-amber-700 text-white font-bold shadow hover:bg-amber-800 transition"
          >
            Save to History
          </button>

          <button
            onClick={handleShare}
            className="px-5 py-2 rounded-md bg-yellow-400 text-gray-800 font-bold shadow"
          >
            Share Results
          </button>
        </section>
      </main>
    </div>
  );
}
