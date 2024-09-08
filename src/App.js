import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import UserInterface from './components/UserInterface';
import ResultsDisplay from './components/ResultsDisplay';
function App() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const memoizedResults = useMemo(() => results, [results]);
    const handleAnalyze = useCallback(async (url) => {
        setLoading(true);
        setError(null);
        setResults(null);
        try {
            console.log(`Sending analysis request for URL: ${url}`);
            const response = await axios.post('/api/analyze', { url }, { timeout: 30000 });
            console.log('Received results:', response.data);
            setResults(response.data);
        }
        catch (error) {
            console.error('Error during analysis:', error);
            if (error.response) {
                setError(`Request failed with status code ${error.response.status}: ${error.response.data.error || 'Unknown error'}`);
            }
            else if (error.request) {
                setError('No response received from the server');
            }
            else {
                setError(error.message || 'An unexpected error occurred');
            }
        }
        finally {
            setLoading(false);
        }
    }, []);
    return (_jsxs("div", { className: "container mx-auto p-4", children: [_jsx("h1", { className: "text-3xl font-bold mb-4", children: "Website Analyzer" }), _jsx(UserInterface, { onAnalyze: handleAnalyze, loading: loading }), loading && _jsx("p", { className: "mt-4", children: "Analyzing website..." }), error && _jsxs("p", { className: "mt-4 text-red-500", children: ["Error: ", error] }), results && _jsx(ResultsDisplay, { results: memoizedResults })] }));
}
export default App;
