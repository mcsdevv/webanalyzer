import React, { useState, useEffect } from 'react';

interface UserInterfaceProps {
  onAnalyze: (url: string) => void;
  loading: boolean;
}

const UserInterface: React.FC<UserInterfaceProps> = ({ onAnalyze, loading }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    console.log('UserInterface Component Mounted');
    return () => {
      console.log('UserInterface Component Unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('URL state changed:', url);
  }, [url]);

  useEffect(() => {
    console.log('Loading state changed:', loading);
  }, [loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with URL:', url);
    onAnalyze(url);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('Input value changed:', newValue);
    setUrl(newValue);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="url"
        value={url}
        onChange={handleChange}
        placeholder="Enter website URL"
        required
        className="w-full p-2 border border-gray-300 rounded"
        disabled={loading}
      />
      <button 
        type="submit" 
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </form>
  );
};

export default UserInterface;