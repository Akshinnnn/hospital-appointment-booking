import React from "react";

const Navbar = () => {
    return (
        <nav>
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                <div className="text-2xl font-bold text-red-600">
                    <a href="/">MediCare</a>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;