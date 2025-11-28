import React from "react";

/**
 * Generic info card used for Symptoms, Treatment, Care Tips
 * props:
 * - title
 * - children (list or content)
 */
const InfoCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h5 className="font-semibold mb-3">{title}</h5>
      <div className="text-sm text-gray-600">{children}</div>
    </div>
  );
};

export default InfoCard;
