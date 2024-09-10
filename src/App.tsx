import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import UserInterface from './components/UserInterface';
import ResultsDisplay from './components/ResultsDisplay';
import { Sun, Moon, Monitor } from 'lucide-react';

// Use the environment variable
const API_URL = import.meta.env.VITE_API_URL || '/api/analyze';
// Theme Toggle Component
const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    }
    return 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-full ${theme === 'light' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}
        aria-label="Light mode"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-full ${theme === 'dark' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}
        aria-label="Dark mode"
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-full ${theme === 'system' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}
        aria-label="System theme"
      >
        <Monitor size={16} />
      </button>
    </div>
  );
};

function App() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      console.log(`Sending analysis request for URL: ${url}`);
      let response;
      try {
        response = await axios.post(API_URL, { url }, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        console.log('Received results:', response.data);
      } catch (requestError) {
        console.error('Error during request:', requestError);
        if (axios.isAxiosError(requestError)) {
          console.error('Axios error details:', requestError.toJSON());
          throw new Error(`Error during request: ${requestError.message}`);
        } else {
          throw new Error(`Error during request: ${(requestError as Error).message}`);
        }
      }
      setResults(response.data);
    } catch (error: any) {
      console.error('Error during analysis:', error);
      if (error.response) {
        console.error('Server error details:', error.response.data);
        setError(`Request failed with status code: ${error.response.status}: ${error.response.data.error || 'Unknown error'}`);
      } else if (error.request) {
        console.error('No response received from the server:');
        setError('No response received from the server');
      } else {
        console.error('Unexpected error:', error);
        setError(error.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Website Analyzer</h1>
          <ThemeToggle />
        </div>
        <UserInterface onAnalyze={handleAnalyze} loading={loading} />
        {loading && <p className="mt-4">Analyzing website...</p>}
        {error && <p className="mt-4 text-destructive">Error: {error}</p>}
        {results && <ResultsDisplay results={results} />}
      </div>
    </div>
  );
}

export default App;