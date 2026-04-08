import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ICONS } from '../constants';

interface MultiSelectComboBoxProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onBlur?: () => void;
}

export const MultiSelectComboBox: React.FC<MultiSelectComboBoxProps> = ({ 
  values, 
  onChange, 
  options, 
  placeholder, 
  className = "", 
  autoFocus = false,
  onBlur
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    const unselectedOptions = options.filter(opt => !values.includes(opt));
    if (!inputValue) return unselectedOptions;
    return unselectedOptions.filter(opt => 
      opt.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [options, inputValue, values]);

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
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleOptionClick = (option: string) => {
    if (!values.includes(option)) {
      onChange([...values, option]);
    }
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveValue = (valueToRemove: string) => {
    onChange(values.filter(v => v !== valueToRemove));
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
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleOptionClick(filteredOptions[highlightedIndex]);
      } else if (inputValue.trim()) {
        if (!values.includes(inputValue.trim())) {
          onChange([...values, inputValue.trim()]);
        }
        setInputValue('');
        setIsOpen(false);
      } else {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Backspace' && !inputValue && values.length > 0) {
      handleRemoveValue(values[values.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex flex-wrap items-center gap-1 p-1 bg-transparent border-b border-transparent focus-within:border-blue-500 transition-colors min-h-[32px]">
        {values.map(val => (
          <span key={val} className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md text-sm">
            {val}
            <button 
              onClick={(e) => { e.stopPropagation(); handleRemoveValue(val); }}
              className="hover:text-blue-300 focus:outline-none"
            >
              <ICONS.X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 bg-transparent outline-none min-w-[60px] text-inherit text-sm py-1"
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
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-xs text-slate-500 italic text-center">
              לחץ Enter כדי להוסיף "{inputValue}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
