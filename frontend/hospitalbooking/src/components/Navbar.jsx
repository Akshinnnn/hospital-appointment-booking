import React from "react";
import { FiMenu } from 'react-icons/fi';
import { FaHeartbeat } from 'react-icons/fa';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <nav className="bg-white shadow-md">
            <div className="font-display h-24 items-center px-4 flex justify-between">

                {/* logo */}
                <div className="flex items-center ml-14">
                    <a href="/"><FaHeartbeat className="inline text-4xl text-green-700 mr-2" /></a> 
                    <a className="text-3xl font-bold text-black-700" href="/">MediCare</a>
                </div>

                {/* buttons desktop */}
                <div className="hidden sm:block space-x-8">
                    <a className="text-gray-800 px-2 py-3 text-xl rounded-xl hover:bg-gray-200" href="/services">Services</a>
                    <a className="text-gray-800 px-2 py-3 text-xl rounded-xl hover:bg-gray-200" href="/doctors">Doctors</a>
                    <a className="text-gray-800 px-2 py-3 text-xl rounded-xl hover:bg-gray-200" href="/about">About</a>
                    <a className="text-gray-800 px-2 py-3 text-xl rounded-xl hover:bg-gray-200" href="/contact">Contact</a>
                </div>

                {/* login/register */}
                <div className="hidden sm:block space-x-6 px-6 mr-14">
                    <a className="text-gray-800 text-xl hover:text-blue-800" href="/login">Log in</a>

                    <a 
                    className="py-4 px-6 rounded-2xl bg-green-700 text-white text-xl hover:bg-green-800 
                    focus:outline-3 focus:outline-offset-2 focus:outline-green-600 active:bg-green-700" href="/register">
                        Sign up
                    </a>
                </div>

                <div className="mr-14 sm:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-3xl px-4 pt-2 text-green-700">
                        <FiMenu />
                    </button>
                </div>
            </div>

            {/* buttons mobile */}
            <div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden bg-gray-100`}>
                <a className="text-center text-gray-800 text-lg px-4 block border-1 border-gray-300 py-2 active:bg-gray-200" href="/services">Services</a>
                <a className="text-center text-gray-800 text-lg px-4 block border-1 border-gray-300 py-2 active:bg-gray-200" href="/doctors">Doctors</a>
                <a className="text-center text-gray-800 text-lg px-4 block border-1 border-gray-300 py-2 active:bg-gray-200" href="/about">About</a>
                <a className="text-center text-gray-800 text-lg px-4 block border-1 border-gray-300 py-2 active:bg-gray-200" href="/contact">Contact</a>
            </div>
        </nav>
    );
}

export default Navbar;