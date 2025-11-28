import React from "react";

const UploadArea = ({ onFileChange }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="text-green-600 text-3xl">☁️</div>
          <h3 className="text-lg font-semibold">Plant Disease Detection</h3>
          <p className="text-sm text-gray-500">Upload your plant photo for instant disease analysis</p>

          <div className="w-full mt-4">
            <label className="inline-block mx-auto">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileChange && onFileChange(e.target.files?.[0])}
                className="hidden"
                id="fileInput"
              />
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-green-600 text-white cursor-pointer">
                Choose File
              </div>
            </label>
            <p className="text-xs text-gray-400 mt-2">Drag and drop or click to browse — supported: JPG, PNG</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;
