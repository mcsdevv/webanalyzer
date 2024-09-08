import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
import UserInterface from './components/UserInterface';
import ResultsDisplay from './components/ResultsDisplay';
function App() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const memoizedResults = useMemo(() => results, [results]);
    useEffect(() => {
        console.log('App Component Mounted');
        return () => {
            console.log('App Component Unmounted');
        };
    }, []);
    useEffect(() => {
        console.log('Results state changed:', results);
    }, [results]);
    useEffect(() => {
        console.log('Loading state changed:', loading);
    }, [loading]);
    useEffect(() => {
        console.log('Error state changed:', error);
    }, [error]);
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
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
                console.error('Error headers:', error.response.headers);
                setError(`Request failed with status code ${error.response.status}: ${error.response.data.error || error.response.data}`);
            }
            else if (error.request) {
                // The request was made but no response was received
                console.error('Error request:', error.request);
                setError('No response received from the server');
            }
            else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error setting up request:', error.message);
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
