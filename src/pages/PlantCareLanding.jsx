import React from 'react';
import Hero from '../components/Hero.jsx';
import Steps from '../components/Steps.jsx';
import WhyChoose from '../components/WhyChoose.jsx';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';

export default function PlantCareLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main>
        <Hero />
        <Steps />
        <WhyChoose />
      </main>
    </div>
  );
}
