import React from "react";

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="font-bold text-lg">About PlantCare</div>
          <p className="mt-3 text-sm text-green-200">
            Helping plant owners diagnose and treat plant diseases quickly and
            reliably.
          </p>
        </div>
        <div>
          <div className="font-semibold">Quick Links</div>
          <ul className="mt-3 text-sm text-green-200 space-y-2">
            <li>How it works</li>
            <li>Features</li>
            <li>Pricing</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Support</div>
          <ul className="mt-3 text-sm text-green-200 space-y-2">
            <li>Help Center</li>
            <li>Contact</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-green-700/40 py-4 text-center text-sm">
        © {new Date().getFullYear()} PlantCare. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
