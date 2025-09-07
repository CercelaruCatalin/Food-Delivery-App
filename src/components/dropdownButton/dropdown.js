import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function Dropdown({ btnName, icon, items, btnPath }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Link 
        href={btnPath || "#"} 
        className="dropdown-btn flex items-center gap-2 rounded-full px-6 py-2 border border-gray-200 text-black hover:bg-gray-50 hover:text-primaryhov hover:border-primaryhov transition-all duration-200"
        onMouseEnter={() => setIsOpen(true)}
        onClick={(e) => btnPath ? null : (e.preventDefault(), setIsOpen(!isOpen))}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {icon}
        <span>{btnName}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Link>
      
      <div 
        className={`dropdown-menu absolute top-full left-0 bg-white shadow-lg rounded-lg p-2 mt-1 min-w-[220px] z-10 transition-all duration-200 origin-top-left ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        onMouseLeave={() => setIsOpen(false)}
      >
        
        {items.map((item, index) => (
          <Link 
            key={index} 
            href={item.path} 
            className="flex w-full items-center text-black hover:text-primaryhov hover:bg-gray-50 rounded-md py-2 px-3 transition-colors"
          >
            {item.icon && item.icon}
            <span className={item.icon ? "ml-2" : ""}>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
