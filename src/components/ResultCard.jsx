import React from "react";
import ResultInterpretation from "./ResultInterpretation.jsx";

/**
 * props:
 * - imageSrc
 * - diseaseTitle
 * - confidence (0-100)
 */
const ResultCard = ({ imageSrc, diseaseTitle = "No result", confidence = 0 }) => {
  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white rounded-lg shadow-sm p-5">
      <div className="flex gap-4 items-center">
        <div className="w-28 h-20 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
          {imageSrc ? (
            <img src={imageSrc} alt="plant" className="object-cover w-full h-full" />
          ) : (
            <div className="text-gray-300">No Image</div>
          )}
        </div>

        <div className="flex-1">
          <ResultInterpretation label={diseaseTitle} confidence={confidence} />
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
