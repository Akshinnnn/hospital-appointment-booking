import React, { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for contacting us!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-green-700 text-white text-center py-20">
        <h1 className="text-4xl font-bold mb-3 pt-10">Contact Us</h1>
        <p className="text-lg max-w-2xl mx-auto">
          We're here to help! Get in touch with our support team for any medical or appointment inquiries.
        </p>
      </div>

      {/* Contact Section */}
      <div className="flex flex-col md:flex-row w-full bg-white border-t border-gray-200">
        {/* Left Side - Info */}
        <div className="md:w-1/2 p-10 bg-green-50 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-green-700 mb-6">Get In Touch</h2>
          <p className="mb-4 text-gray-700">
            <strong>Address:</strong> 123 Health Street, MediCity
          </p>
          <p className="mb-4 text-gray-700">
            <strong>Phone:</strong> +1 (555) 123-4567
          </p>
          <p className="mb-4 text-gray-700">
            <strong>Email:</strong> contact@medicare.com
          </p>
          <p className="text-gray-700">
            <strong>Hours:</strong> Mon - Fri: 9:00 AM - 6:00 PM
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-10 bg-gray-50">
          <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
            Send a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-green-600"
                rows="4"
                required
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-8 transition-all"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
