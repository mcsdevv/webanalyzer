import { useState, useCallback } from 'react';
import axios from 'axios';

function App() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResponse('');
    try {
      const result = await axios.get('/api/hello');
      setResponse(JSON.stringify(result.data));
    } catch (error: any) {
      console.error('Error during API test:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">API Test</h1>
      <button onClick={handleTest} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded">
        {loading ? 'Testing...' : 'Test API'}
      </button>
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}
      {response && <pre className="mt-4 p-2 bg-gray-100 rounded">{response}</pre>}
    </div>
  );
}

export default App;