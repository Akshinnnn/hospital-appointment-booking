import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"
import Home from "./components/Home";
import Appointment from "./components/Appointment";
import Footer from "./components/Footer";

function App() {
  return ( 
  <Router>   
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/appointment" element={<Appointment />} />
    </Routes>
    <Footer />
  </Router>
  );
}

export default App
