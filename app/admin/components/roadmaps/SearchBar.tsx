import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <input
    className="border p-2 rounded w-48"
    placeholder="Search roadmaps..."
    value={value}
    onChange={e => onChange(e.target.value)}
  />
);

export default SearchBar; 