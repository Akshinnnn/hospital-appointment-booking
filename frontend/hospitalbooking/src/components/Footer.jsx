import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand / About */}
        <div>
          <h2 className="text-2xl font-bold mb-4">MediCare</h2>
          <p className="text-gray-200">
            Your trusted health partner for life. We provide quality care,
            expert doctors, and accessible medical support for everyone.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-200">
            <li><a href="/" className="hover:text-white transition">Home</a></li>
            <li><a href="/about" className="hover:text-white transition">About</a></li>
            <li><a href="/appointment" className="hover:text-white transition">Book Appointment</a></li>
            <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
          <ul className="space-y-3 text-gray-200">
            <li className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-white" /> 
              123 Health Street, MediCity
            </li>
            <li className="flex items-center gap-3">
              <FaPhone className="text-white" /> 
              +1 (555) 123-4567
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-white" /> 
              contact@medicare.com
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-gray-300"><FaFacebook size={24} /></a>
            <a href="#" className="hover:text-gray-300"><FaInstagram size={24} /></a>
            <a href="#" className="hover:text-gray-300"><FaLinkedin size={24} /></a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-green-700 mt-10 pt-6 text-center text-gray-300 text-sm">
        © {new Date().getFullYear()} MediCare. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
