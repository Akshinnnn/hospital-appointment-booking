import React, { useEffect, useState } from "react";
import contactImage from "../assets/young-female-doctor.jpg"; 

const Appointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    appointmentTime: "",
    reason: "",
    notes: "",
  });

  // Fetch all doctors
  useEffect(() => {
    fetch("http://localhost:8080/api/doctor")
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((err) => console.error("Failed to load doctors:", err));
  }, []);

  // Fetch schedule for selected doctor
  useEffect(() => {
    if (!selectedDoctor) return;
    const url = `http://localhost:8080/api/${selectedDoctor}/schedule?date=2025-09-25T10:00:00Z`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setAvailableTimes(data))
      .catch((err) => console.error("Failed to load schedule:", err));
  }, [selectedDoctor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const appointment = {
      doctorId: selectedDoctor,
      appointmentTime: form.appointmentTime,
      notes: form.notes || form.reason,
    };

    fetch("http://localhost:8080/api/appointment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create appointment");
        alert("Appointment created successfully!");
        setForm({ fullName: "", appointmentTime: "", reason: "", notes: "" });
        setSelectedDoctor("");
      })
      .catch((err) => alert(err.message));
  };

  return (
    <section className="py-20 bg-gray-50 flex justify-center">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left side */}
        <div className="md:w-1/2 relative">
          <img
            src={contactImage}
            alt="Doctor contact"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-40"></div>

          <div className="absolute bottom-0 p-8 text-white">
            <h3 className="text-2xl font-bold mb-3">Contact Us</h3>
            <p className="text-lg">📍 123 Health Street, MediCity</p>
            <p className="text-lg">📞 +1 (555) 123-4567</p>
            <p className="text-lg">✉️ contact@medicare.com</p>
            <p className="text-lg mt-3">Mon - Fri: 9:00 AM - 6:00 PM</p>
          </div>
        </div>

        {/* Right side (form) */}
        <div className="md:w-1/2 p-10">
          <h2 className="text-3xl font-bold text-center mb-8 text-green-700">
            Book an Appointment
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600"
                required
              />
            </div>

            {/* Doctor */}
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Choose Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600"
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Available Time */}
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Available Time
              </label>
              <select
                name="appointmentTime"
                value={form.appointmentTime}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600"
                required
              >
                <option value="">Select time</option>
                {availableTimes.map((slot, index) => (
                  <option key={index} value={slot}>
                    {new Date(slot).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Reason for Visit
              </label>
              <input
                type="text"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600"
                placeholder="e.g. Follow-up visit for blood pressure"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600"
                rows="4"
                placeholder="Write any extra details here..."
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-10 rounded-xl transition-all"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Appointment;
