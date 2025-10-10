import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"
import Home from "./components/Home";
import Appointment from "./components/Appointment";
import Footer from "./components/Footer";
import Login from "./components/Login";
import About from "./components/About";
import Contact from "./components/Contact";

function App() {
  return ( 
  <Router>   
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/appointment" element={<Appointment />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
    <Footer />
  </Router>
  );
}

export default App
