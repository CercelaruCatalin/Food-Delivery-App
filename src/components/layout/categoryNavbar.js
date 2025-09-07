"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function CategoryNavbar({ categories }) {
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'All');
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const categoryElements = categories.map(cat => document.getElementById(`category-${cat}`));
      const headerHeight = 75; // Adjust based on your header height
      
      // Set sticky when scrolled past the original position
      if (navRef.current) {
        const navPosition = navRef.current.offsetTop;
        setIsSticky(window.scrollY > navPosition - headerHeight);
      }
      
      // Update active category based on scroll position
      const scrollPosition = window.scrollY + headerHeight + 50;
      
      // Find the section currently in view
      for (let i = categoryElements.length - 1; i >= 0; i--) {
        const element = categoryElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveCategory(categories[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [categories]);

  const scrollToCategory = (category) => {
    setActiveCategory(category);
    const element = document.getElementById(`category-${category}`);
    if (element) {
      const headerOffset = 120; // Adjust based on your header and navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      ref={navRef}
      className={`bg-white border-b z-10 transition-all duration-200 ${
        isSticky ? 'sticky top-20 shadow-md' : ''
      }`}
    >
      <div className="overflow-x-auto flex px-4 py-4 gap-3 whitespace-nowrap">
        {categories.map(category => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => scrollToCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}