const WhyChoose = () => {
  const cards = [
    {
      title: "Fast AI Diagnosis",
      desc: "Get results in seconds with our advanced AI",
      icon: "⚡",
    },
    {
      title: "Expert Recommendations",
      desc: "Guidance curated by plant experts",
      icon: "🌿",
    },
    {
      title: "Disease Library",
      desc: "Comprehensive database of plant diseases",
      icon: "📚",
    },
    {
      title: "Easy to Use",
      desc: "Simple interface designed for everyone",
      icon: "👍",
    },
  ];

  return (
    <section id="features" className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center">Why Choose PlantCare</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {cards.map((c, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-2xl">{c.icon}</div>
              <h3 className="mt-3 font-semibold">{c.title}</h3>
              <p className="mt-2 text-gray-600">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default WhyChoose;
