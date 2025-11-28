import React from 'react';
import image from "../assets/image.png";

const Hero = () => {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Your AI-Powered Plant Doctor
          </h1>
          <p className="mt-4 text-gray-600">
            Instant plant disease diagnosis and treatment recommendations for
            healthy, thriving plants.
          </p>
          <div className="mt-6 flex gap-4">
            <label className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer">
              <input type="file" className="hidden" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h4l1-2h8l1 2h4v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                />
              </svg>
              Upload Image
            </label>
            <button className="px-4 py-2 rounded-lg border border-green-600 text-green-600">
              Try Demo
            </button>
          </div>
        </div>

        <div className="w-full">
          {image ? (
            <img
              src={image}
              alt="plant"
              className="w-full rounded-2xl shadow-lg object-cover h-50 md:h-96"
            />
          ) : (
            <div className="w-full rounded-2xl shadow-lg bg-linear-to-br from-green-700 to-green-900 h-50 md:h-96 flex items-center justify-center text-white">
              <span className="opacity-80">Hero Image</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
export default Hero;