'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './CustomSelect.css';

export default function CustomSelect({ options, value, onChange, placeholder = "Select option", labelKey = "name", valueKey = "id" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => 
    (typeof opt === 'object' ? opt[valueKey] : opt).toString() === value.toString()
  );

  return (
    <div className="custom-select-wrapper" ref={dropdownRef}>
      <div 
        className={`custom-select-trigger ${isOpen ? 'open' : ''} ${!value ? 'placeholder' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {selectedOption 
            ? (typeof selectedOption === 'object' ? selectedOption[labelKey] : selectedOption)
            : placeholder
          }
        </span>
        <ChevronDown size={18} className={`chevron-icon ${isOpen ? 'rotate' : ''}`} />
      </div>
      
      {isOpen && (
        <ul className="custom-select-options">
          {options.map((option, idx) => {
            const optValue = typeof option === 'object' ? option[valueKey] : option;
            const optLabel = typeof option === 'object' ? option[labelKey] : option;
            return (
              <li 
                key={idx}
                className={`custom-select-option ${optValue.toString() === value.toString() ? 'selected' : ''}`}
                onClick={() => {
                  onChange({ target: { value: optValue } });
                  setIsOpen(false);
                }}
              >
                {optLabel}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
