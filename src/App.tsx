import { useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import UserInterface from './components/UserInterface';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memoizedResults = useMemo(() => results, [results]);

  const handleAnalyze = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      console.log(`Sending analysis request for URL: ${url}`);
      const response = await axios.post('/api/analyze', { url }, { timeout: 30000 });
      console.log('Received results:', response.data);
      setResults(response.data);
    } catch (error: any) {
      console.error('Error during analysis:', error);
      if (error.response) {
        setError(`Request failed with status code ${error.response.status}: ${error.response.data.error || 'Unknown error'}`);
      } else if (error.request) {
        setError('No response received from the server');
      } else {
        setError(error.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Website Analyzer</h1>
      <UserInterface onAnalyze={handleAnalyze} loading={loading} />
      {loading && <p className="mt-4">Analyzing website...</p>}
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}
      {results && <ResultsDisplay results={memoizedResults} />}
    </div>
  );
}

export default App;