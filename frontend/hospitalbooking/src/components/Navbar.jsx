import React, { useState, useEffect } from "react";
import { FiMenu, FiUser } from "react-icons/fi";
import { FaHeartbeat } from "react-icons/fa";
import authService from "../services/authService";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [role, setRole] = useState("anonymous"); // default

  const user = authService.getUserInfo();

  useEffect(() => {
    const updateRole = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const user = authService.getUserInfo();
          setRole(user.role || "anonymous");
        } catch {
          setRole("anonymous");
        }
      } else {
        setRole("anonymous");
      }
    };

    updateRole(); 

    window.addEventListener("authChanged", updateRole);
    return () => window.removeEventListener("authChanged", updateRole);
  }, []);


  // Define menu per role
  const getMenuItems = () => {
    switch (role) {
      case "PATIENT":
        return [
          { label: "Services", path: "/services" },
          { label: "Appointment", path: "/appointment" },
          { label: "Doctors", path: "/doctors" },
          { label: "Records", path: "/records" },
          { label: "Contact", path: "/contact" },
        ];
      case "DOCTOR":
        return [
          { label: "Patients", path: "/patients" },
          { label: "Schedule", path: "/schedule" },
          { label: "Records", path: "/records" },
          { label: "Contact", path: "/contact" },
        ];
      case "ADMIN":
        return [
          { label: "Dashboard", path: "/admin" },
          { label: "Users", path: "/admin/users" },
          { label: "Appointments", path: "/admin/appointments" },
          { label: "Settings", path: "/admin/settings" },
        ];
      default:
        return [
          { label: "Services", path: "/services" },
          { label: "Appointment", path: "/appointment" },
          { label: "Doctors", path: "/doctors" },
          { label: "About", path: "/about" },
          { label: "Contact", path: "/contact" },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-gray-100 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="h-20 flex items-center justify-between px-4 sm:px-12 font-medium">

        {/* Left corner (mobile: login or profile icon) */}
        <div className="sm:hidden flex items-center">
          {role === "anonymous" ? (
            <a href="/login" className="text-3xl text-green-700">
              <FiUser />
            </a>
          ) : (
            <a href="/myprofile" className="text-3xl text-green-700">
              <FiUser />
            </a>
          )}
        </div>

        {/* Center logo */}
        <div className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 sm:static sm:translate-x-0">
          <a href="/" className="flex items-center space-x-2">
            <FaHeartbeat className="text-4xl text-green-700" />
            <span className="text-2xl sm:text-3xl font-bold text-gray-800">
              MediCare
            </span>
          </a>
        </div>

        {/* Right corner (mobile menu toggle) */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-3xl text-green-700"
          >
            <FiMenu />
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden sm:flex items-center space-x-8 ml-auto">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.path}
              className="text-gray-800 text-lg px-3 py-2 rounded-xl hover:bg-gray-200 transition"
            >
              {item.label}
            </a>
          ))}

          {role === "anonymous" ? (
            <>
              <a href="/login" className="text-gray-800 text-lg hover:text-blue-700">
                Log in
              </a>
              <a
                href="/register"
                className="bg-green-700 text-white px-5 py-2 rounded-xl text-lg hover:bg-green-800 transition"
              >
                Sign up
              </a>
            </>
          ) : (
            <a
              href="/myprofile"
              className="text-3xl text-green-700 hover:text-green-800"
              title="My Profile"
            >
              <FiUser />
            </a>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } sm:hidden bg-gray-100 shadow-md absolute w-full left-0 top-20 border-t border-gray-200`}
      >
        {menuItems.map((item) => (
          <a
            key={item.label}
            href={item.path}
            className="block text-center text-gray-800 text-lg py-3 hover:bg-gray-200"
          >
            {item.label}
          </a>
        ))}

        {role === "anonymous" ? (
          <>
            <a
              href="/login"
              className="block text-center text-gray-800 text-lg py-3 hover:bg-gray-200"
            >
              Log in
            </a>
            <a
              href="/register"
              className="block text-center text-gray-800 text-lg py-3 hover:bg-gray-200"
            >
              Sign up
            </a>
          </>
        ) : (
          <a
            href="/myprofile"
            className="block text-center text-green-700 text-lg py-3 hover:bg-green-100"
          >
            My Profile
          </a>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
