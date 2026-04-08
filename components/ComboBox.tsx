
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ICONS } from '../constants';

interface ComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onBlur?: () => void;
}

export const ComboBox: React.FC<ComboBoxProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  className = "", 
  autoFocus = false,
  onBlur
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;
    return options.filter(opt => 
      opt.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [options, inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
    // Real-time update for the parent if they want it, 
    // but typically for free text we might wait for blur/enter.
    // Given the app's style, we update on every keystroke.
    onChange(val);
  };

  const handleOptionClick = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleOptionClick(filteredOptions[highlightedIndex]);
      } else {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none pr-3 pl-8 py-1 text-inherit"
        />
        <div 
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-blue-400 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ICONS.ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (filteredOptions.length > 0 || inputValue) && (
        <div className="absolute z-[1100] top-full right-0 left-0 mt-1 bg-[#1c2128] border border-[#30363d] rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
          {filteredOptions.length > 0 ? (
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-[#30363d] mb-1">
                הצעות וערכים קודמים
              </div>
              {filteredOptions.map((option, index) => (
                <button
                  key={option}
                  className={`w-full text-right px-4 py-2 text-sm transition-colors flex items-center justify-between group ${
                    index === highlightedIndex ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-[#30363d]'
                  }`}
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span>{option}</span>
                  {index === highlightedIndex && <ICONS.CheckCircle2 className="w-3.5 h-3.5 opacity-50" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-xs text-slate-500 italic text-center">
              ערך חדש יתווסף לרשימה לאחר השמירה
            </div>
          )}
        </div>
      )}
    </div>
  );
};
