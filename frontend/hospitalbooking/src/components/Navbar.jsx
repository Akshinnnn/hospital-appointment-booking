import React from "react";
import { FiMenu } from 'react-icons/fi';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <nav className="bg-white shadow-md">
            <div className="h-20 items-center px-4 flex justify-between">

                {/* logo */}
                <div><a className="text-3xl font-bold text-black-700" href="/">MediCare</a></div>

                {/* buttons desktop */}
                <div className="hidden sm:block space-x-8">
                    <a className="text-gray-800 text-2xl hover:text-green-800" href="/services">Services</a>
                    <a className="text-gray-800 text-2xl hover:text-green-800" href="/doctors">Doctors</a>
                    <a className="text-gray-800 text-2xl hover:text-green-800" href="/about">About</a>
                    <a className="text-gray-800 text-2xl hover:text-green-800" href="/contact">Contact</a>
                </div>

                {/* login/register */}
                <div className="hidden sm:block space-x-6 px-6">
                    <a className="text-gray-800 text-2xl hover:text-green-800" href="/login">Login</a>

                    <a 
                    className="py-2 px-6 rounded-xl bg-green-700 text-white text-2xl hover:bg-green-800 
                    focus:outline-3 focus:outline-offset-2 focus:outline-green-600 active:bg-green-700" href="/register">
                        Register
                    </a>
                </div>

                <div className="sm:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-3xl px-4 pt-2 text-green-700">
                        <FiMenu />
                    </button>
                </div>
            </div>

            {/* buttons mobile */}
            <div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden bg-gray-100`}>
                <a className="text-center text-gray-800 text-lg px-4 block border-1 border-gray-300 py-2 hover:text-green-800 " href="/services">Services</a>
                <a className="text-center text-gray-800 text-lg px-4 block border-1 border-gray-300 py-2 hover:text-green-800" href="/doctors">Doctors</a>
                <a className="text-center text-gray-800 text-lg px-4 block border-1 border-gray-300 py-2 hover:text-green-800" href="/about">About</a>
                <a className="text-center text-gray-800 text-lg px-4 block border-1 border-gray-300 py-2 hover:text-green-800" href="/contact">Contact</a>
            </div>
        </nav>
    );
}

export default Navbar;