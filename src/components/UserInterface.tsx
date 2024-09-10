import React, { useState, useEffect } from 'react';

interface UserInterfaceProps {
  onAnalyze: (url: string) => void;
  loading: boolean;
}

const UserInterface: React.FC<UserInterfaceProps> = ({ onAnalyze, loading }) => {
  const [url, setUrl] = useState('');

  // useEffect(() => {
  //   console.log('UserInterface Component Mounted');
  //   return () => {
  //     console.log('UserInterface Component Unmounted');
  //   };
  // }, []);

  // useEffect(() => {
  //   console.log('URL state changed:', url);
  // }, [url]);

  // useEffect(() => {
  //   console.log('Loading state changed:', loading);
  // }, [loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with URL:', url);
    onAnalyze(url);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // console.log('Input value changed:', newValue);
    setUrl(newValue);
  };

  // Get the current theme from the root element
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          setTheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  const inputClassName = `w-full p-2 border rounded ${
    theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-black'
  }`;

  const buttonClassName = `px-4 py-2 rounded ${
    loading
      ? 'bg-blue-300 text-gray-500 cursor-not-allowed'
      : theme === 'dark'
      ? 'bg-blue-700 text-white'
      : 'bg-blue-500 text-white'
  }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="url"
        value={url}
        onChange={handleChange}
        placeholder="Enter website URL"
        required
        className={inputClassName}
        disabled={loading}
      />
      <button type="submit" className={buttonClassName} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </form>
  );
};

export default UserInterface;