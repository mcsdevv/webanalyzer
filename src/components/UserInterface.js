import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const UserInterface = ({ onAnalyze, loading }) => {
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
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted with URL:', url);
        onAnalyze(url);
    };
    const handleChange = (e) => {
        const newValue = e.target.value;
        console.log('Input value changed:', newValue);
        setUrl(newValue);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx("input", { type: "url", value: url, onChange: handleChange, placeholder: "Enter website URL", required: true, className: "w-full p-2 border border-gray-300 rounded", disabled: loading }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300", disabled: loading, children: loading ? 'Analyzing...' : 'Analyze' })] }));
};
export default UserInterface;
