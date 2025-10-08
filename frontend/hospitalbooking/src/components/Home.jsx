import React from "react";
import doctorbg from "../assets/doctorbg.jpg";
import Appointment from "./Appointment";

const Home = () => {
  return ( <>
    <div
      className="h-screen w-full bg-cover bg-center relative flex items-center justify-center"
      style={{ backgroundImage: `url(${doctorbg})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* content */}
      <div className="relative text-center text-white px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Your Most Trusted Health Partner for Life
        </h1>
        <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto">
          We offer free consulting, personalized care, and access to the best doctors — 
          because your health deserves excellence every day.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <a
            href="/appointment"
            className="bg-green-700 hover:bg-green-800 text-white text-lg font-semibold py-3 px-8 rounded-xl shadow-lg transition-all"
          >
            Book Appointment
          </a>
          <a
            href="/about"
            className="bg-transparent border-2 border-white hover:bg-white hover:text-green-800 text-white text-lg font-semibold py-3 px-8 rounded-xl transition-all"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>

    <Appointment />
    </>
  );
};

export default Home;
