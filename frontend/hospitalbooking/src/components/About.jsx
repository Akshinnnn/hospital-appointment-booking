import React from "react";
import doctorImg1 from "../assets/doctor1.jpg";
import doctorImg2 from "../assets/doctor2.jpg";
import doctorImg3 from "../assets/doctor3.jpg";

const About = () => {
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Lee",
      specialty: "Cardiologist",
      info: "Expert in heart health and preventive cardiology with over 10 years of experience.",
      image: doctorImg1,
    },
    {
      id: 2,
      name: "Dr. Michael Smith",
      specialty: "Dermatologist",
      info: "Focused on skincare, treatment of chronic conditions, and aesthetic dermatology.",
      image: doctorImg2,
    },
    {
      id: 3,
      name: "Dr. Priya Patel",
      specialty: "Pediatrician",
      info: "Dedicated to providing compassionate care for children and families.",
      image: doctorImg3,
    },
  ];

  const services = [
    "General Health Checkups",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Emergency Care",
    "Telemedicine Consultations",
  ];

  return (
    <section className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-green-700 text-white text-center py-20">
        <h1 className="text-4xl font-bold mb-3">About MediCare</h1>
        <p className="text-lg max-w-2xl mx-auto">
          Your trusted health partner for life. We provide quality care, expert doctors,
          and accessible medical support for everyone.
        </p>
      </div>

      {/* About Content */}
      <div className="max-w-6xl mx-auto py-16 px-6 text-gray-700">
        <h2 className="text-3xl font-bold text-green-700 mb-6">Who We Are</h2>
        <p className="mb-6">
          At <span className="font-semibold text-green-700">MediCare</span>, we are
          committed to improving health outcomes by providing exceptional medical care
          and building lasting patient relationships. Our facilities are equipped with
          state-of-the-art technology, and our medical staff is trained to offer
          compassionate, personalized treatment for every patient.
        </p>

        <h2 className="text-3xl font-bold text-green-700 mb-6">Our Services</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {services.map((service, index) => (
            <li
              key={index}
              className="border border-gray-200 bg-white p-4 rounded-lg shadow-sm hover:shadow-md"
            >
              {service}
            </li>
          ))}
        </ul>

        {/* Doctors Section */}
        <h2 className="text-3xl font-bold text-green-700 mb-6">Meet Our Doctors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md overflow-hidden"
            >
              <img
                src={doc.image}
                alt={doc.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-5 text-center">
                <h3 className="text-xl font-semibold text-gray-800">{doc.name}</h3>
                <p className="text-green-700">{doc.specialty}</p>
                <p className="text-gray-600">{doc.info}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
