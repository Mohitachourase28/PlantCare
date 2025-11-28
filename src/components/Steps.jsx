export default function ResultsCard({ result }) {
  if (!result) return null;
  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <div className="flex items-start gap-4">
        <img src={result.imageUrl || '/placeholder.png'} alt="plant" className="w-28 h-20 object-cover rounded" />
        <div>
          <h3 className="text-lg font-semibold">{result.diagnosis}</h3>
          <p className="text-sm">Confidence: {Math.round(result.confidence * 100)}%</p>
          <div className="mt-2 text-sm text-gray-700">
            <strong>Treatment:</strong>
            <ul className="list-disc ml-5">
              {result.treatment?.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
