import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="max-w-6xl mx-auto sticky top-2 flex justify-between items-center h-16">
      <Link to="/" className="text-2xl font-bold">
        mod<span className="font-instrument text-primary">Hub</span>
      </Link>
      <Link
        to="/"
        className="px-4 py-2 bg-primary text-dark rounded-full font-medium"
      >
        Try Now
      </Link>
    </nav>
  );
};

export default Navbar;
