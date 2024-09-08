import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
const ResultsDisplay = React.memo(({ results }) => {
    const mermaidRef = useRef(null);
    const [diagramError, setDiagramError] = useState(null);
    const [diagramSvg, setDiagramSvg] = useState(null);
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            securityLevel: 'loose',
            theme: 'default',
        });
    }, []);
    useEffect(() => {
        if (results.architecture_diagram) {
            renderDiagram();
        }
    }, [results.architecture_diagram]);
    const renderDiagram = async () => {
        if (results.architecture_diagram) {
            try {
                const { svg } = await mermaid.render('mermaid-diagram', results.architecture_diagram);
                setDiagramSvg(svg);
                setDiagramError(null);
            }
            catch (error) {
                setDiagramError(`Failed to render the architecture diagram: ${error instanceof Error ? error.message : String(error)}`);
                setDiagramSvg(null);
            }
        }
    };
    const formatResults = (analysisResults) => {
        if (!analysisResults) {
            return _jsx("div", { children: "No analysis results available." });
        }
        if (analysisResults.error) {
            return (_jsxs("div", { className: "text-red-500", children: [_jsx("h3", { className: "text-xl font-semibold", children: "Error" }), _jsx("p", { children: analysisResults.error })] }));
        }
        return (_jsxs(_Fragment, { children: [analysisResults.basic_info && (_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-xl font-semibold", children: "Basic Information" }), analysisResults.basic_info.title && (_jsxs("p", { children: [_jsx("strong", { children: "Title:" }), " ", analysisResults.basic_info.title] })), analysisResults.basic_info.description && (_jsxs("p", { children: [_jsx("strong", { children: "Description:" }), " ", analysisResults.basic_info.description] }))] })), analysisResults.hosting_provider && (_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-xl font-semibold", children: "Hosting Provider" }), _jsx("p", { children: analysisResults.hosting_provider })] })), analysisResults.architecture && (_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-xl font-semibold", children: "Architecture" }), _jsx("p", { children: analysisResults.architecture })] })), analysisResults.marketing_technologies && analysisResults.marketing_technologies.length > 0 && (_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-xl font-semibold", children: "Marketing Technologies" }), _jsx("ul", { className: "list-disc list-inside", children: analysisResults.marketing_technologies.map((tech, index) => (_jsx("li", { children: tech }, index))) })] })), analysisResults.social_links && analysisResults.social_links.length > 0 && (_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-xl font-semibold", children: "Social Links" }), _jsx("ul", { className: "list-disc list-inside", children: analysisResults.social_links.map((link, index) => (_jsx("li", { children: _jsx("a", { href: link, target: "_blank", rel: "noopener noreferrer", children: link }) }, index))) })] })), Object.entries(analysisResults).map(([key, value]) => {
                    if (['basic_info', 'hosting_provider', 'architecture', 'marketing_technologies', 'social_links'].includes(key)) {
                        return null;
                    }
                    return (_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-xl font-semibold", children: formatKey(key) }), key === 'html_structure' && typeof value === 'object' && value !== null
                                ? renderHtmlStructure(value)
                                : renderValue(value)] }, key));
                })] }));
    };
    const formatKey = (key) => {
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };
    const renderHtmlStructure = (structure) => {
        const totalElements = Object.values(structure).reduce((sum, count) => sum + count, 0);
        const sortedElements = Object.entries(structure).sort((a, b) => b[1] - a[1]);
        const topElements = sortedElements.slice(0, 10);
        const calculatePercentage = (count) => ((count / totalElements) * 100).toFixed(2);
        return (_jsxs("div", { children: [_jsxs("p", { children: ["Total HTML elements: ", totalElements] }), _jsx("h4", { className: "text-lg font-semibold mt-2", children: "Top 10 most frequent elements:" }), _jsx("ul", { className: "list-disc list-inside", children: topElements.map(([element, count]) => (_jsxs("li", { children: [_jsx("code", { children: element }), ": ", count, " (", calculatePercentage(count), "%)"] }, element))) })] }));
    };
    const renderValue = (value) => {
        if (typeof value === 'object' && value !== null) {
            return (_jsx("ul", { className: "list-disc list-inside", children: Object.entries(value).map(([key, val]) => (_jsxs("li", { children: [_jsx("code", { children: key }), ": ", renderValue(val)] }, key))) }));
        }
        return _jsx("code", { children: String(value) });
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-4", children: [diagramSvg && (_jsxs("div", { className: "mt-4", ref: mermaidRef, children: [_jsx("h2", { className: "text-2xl font-semibold mb-2", children: "Architecture Diagram" }), _jsx("div", { dangerouslySetInnerHTML: { __html: diagramSvg } })] })), diagramError && (_jsxs("div", { className: "mt-4 text-red-500", children: [_jsx("h2", { className: "text-2xl font-semibold mb-2", children: "Error rendering diagram" }), _jsx("p", { children: diagramError })] })), _jsx("h1", { className: "text-3xl font-semibold mb-4", children: "Website Analysis Results" }), formatResults(results.analysis_results)] }));
});
export default ResultsDisplay;
