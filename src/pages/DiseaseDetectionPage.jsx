// import React, { useState } from 'react';
// import ResultInterpretation from '../components/ResultInterpretation';

// const DiseaseDetectionPage = () => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [analysisResult, setAnalysisResult] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleFileChange = (event) => {
//     setSelectedFile(event.target.files[0]);
//     setAnalysisResult(null);
//   };

//   const handleAnalyze = () => {
//     if (!selectedFile) return;
//     setIsLoading(true);
//     // Simulate API call
//     setTimeout(() => {
//       setAnalysisResult({
//         disease: 'Leaf Spot Disease',
//         confidence: 96,
//         symptoms: ['Brown spots on leaves', 'Yellowing around the spots', 'Premature leaf drop'],
//         treatment: ['Remove affected leaves', 'Apply a copper-based fungicide', 'Ensure good air circulation'],
//         careTips: ['Water at the base of the plant', 'Avoid overhead watering', 'Fertilize properly'],
//       });
//       setIsLoading(false);
//     }, 2000);
//   };

//   return (
//     <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
//       <h1 className="text-3xl font-bold text-gray-900">Plant Disease Detection</h1>
//       <p className="mt-2 text-gray-600">Upload a photo of your plant to get an AI-powered diagnosis.</p>
      
//       <div className="mt-8 bg-white shadow-lg rounded-lg p-8">
//         <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//           {selectedFile ? (
//             <div>
//               <p className="text-sm text-gray-600">Selected file: {selectedFile.name}</p>
//               <img src={URL.createObjectURL(selectedFile)} alt="Plant preview" className="mt-4 mx-auto h-48 w-48 object-cover rounded-md" />
//             </div>
//           ) : (
//             <div>
//               <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
//                 <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//               <div className="flex text-sm text-gray-600 mt-4">
//                 <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
//                   <span>Upload a file</span>
//                   <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
//                 </label>
//                 <p className="pl-1">or drag and drop</p>
//               </div>
//               <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
//             </div>
//           )}
//         </div>
//         <button onClick={handleAnalyze} disabled={!selectedFile || isLoading} className="mt-6 w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium disabled:bg-gray-400">
//           {isLoading ? 'Analyzing...' : 'Analyze Plant Health'}
//         </button>
//       </div>

//       {analysisResult && (
//         <div className="mt-8 bg-white shadow-lg rounded-lg p-8">
//           <h2 className="text-2xl font-bold text-gray-900">Analysis Result</h2>
//           <ResultInterpretation label={analysisResult.disease} confidence={analysisResult.confidence} details={analysisResult} />
          
//           <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <h4 className="font-semibold text-gray-800">Symptoms</h4>
//               <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
//                 {analysisResult.symptoms.map((symptom, index) => <li key={index}>{symptom}</li>)}
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold text-gray-800">Treatment</h4>
//               <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
//                 {analysisResult.treatment.map((treatment, index) => <li key={index}>{treatment}</li>)}
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold text-gray-800">Care Tips</h4>
//               <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
//                 {analysisResult.careTips.map((tip, index) => <li key={index}>{tip}</li>)}
//               </ul>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DiseaseDetectionPage;