import React, { useState } from 'react';

interface UserInterfaceProps {
  onAnalyze: (url: string) => void;
  loading: boolean;
}

const UserInterface: React.FC<UserInterfaceProps> = ({ onAnalyze, loading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
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