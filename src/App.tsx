import { useState } from 'react';
import UserInterface from './components/UserInterface';
import ResultsDisplay from './components/ResultsDisplay';
import axios from 'axios';
import React from 'react';

function App() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await axios.post('http://localhost:3001/analyze', { url });
      console.log('Received results:', response.data);
      console.log('Architecture diagram:', response.data.architecture_diagram);
      setResults(response.data);
    } catch (error) {
      console.error('Error during analysis:', error);
      setError(error as any);
    } finally {
      setLoading(false);
    }
  };

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