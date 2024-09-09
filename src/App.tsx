import { useState, useCallback } from 'react';
import axios from 'axios';
import UserInterface from './components/UserInterface';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      console.log(`Sending analysis request for URL A: ${url}`);
      let response;
      try {
        response = await axios.post('/api/analyze', { url }, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        console.log('Received results A:', response.data);
      } catch (requestError) {
        console.error('Error during request A:', requestError);
        if (axios.isAxiosError(requestError)) {
          console.error('Axios error details A:', requestError.toJSON());
          throw new Error(`Error during request A: ${requestError.message}`);
        } else {
          throw new Error(`Error during request A: ${(requestError as Error).message}`);
        }
      }
      setResults(response.data);
    } catch (error: any) {
      console.error('Error during analysis A:', error);
      if (error.response) {
        console.error('Server error details A:', error.response.data);
        setError(`Request failed with status code A: ${error.response.status}: ${error.response.data.error || 'Unknown error'}`);
      } else if (error.request) {
        console.error('No response received from the server A:');
        setError('No response received from the server A:');
      } else {
        console.error('Unexpected error A:', error);
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
      {results && <ResultsDisplay results={results} />}
    </div>
  );
}

export default App;