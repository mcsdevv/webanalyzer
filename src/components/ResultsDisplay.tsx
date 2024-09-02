import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface ResultsDisplayProps {
  results: {
    analysis_results: {
      error?: string;
      basic_info?: Record<string, string>;
      html_structure: Record<string, number>;
      meta_tags: Record<string, string>;
      css_frameworks: string[];
      javascript_libraries: string[];
      server_technologies: string[];
      hosting_provider: string;
      cdn_provider: string;
      cms: string;
      ecommerce_platform: string;
      analytics_tools: string[];
      advertising_networks: string[];
      security_measures: string[];
      performance_optimizations: string[];
      accessibility_features: string[];
      seo_analysis: Record<string, any>;
      third_party_services: string[];
      programming_languages: string[];
      database_technologies: string[];
      api_integrations: string[];
    };
    architecture_diagram: string;
  };
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {  const mermaidRef = useRef<HTMLDivElement>(null);
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const [diagramSvg, setDiagramSvg] = useState<string | null>(null);

  useEffect(() => {
    console.log("ResultsDisplay mounted");
    mermaid.initialize({
      startOnLoad: true,
      securityLevel: "loose",
      theme: "default",
    });
    return () => console.log("ResultsDisplay unmounted");
  }, []);

  useEffect(() => {
    console.log("Results changed:", results);
    if (results.architecture_diagram) {
      console.log("Attempting to render diagram");
      renderDiagram();
    }
  }, [results.architecture_diagram]);

  const renderDiagram = async () => {
    if (results.architecture_diagram) {
      try {
        console.log("Rendering diagram with content:", results.architecture_diagram);
        const { svg } = await mermaid.render(
          "mermaid-diagram",
          results.architecture_diagram
        );
        console.log("Diagram rendered successfully");
        setDiagramSvg(svg);
        setDiagramError(null);
      } catch (error) {
        console.error("Error rendering Mermaid diagram:", error);
        setDiagramError(
          `Failed to render the architecture diagram: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        setDiagramSvg(null);
      }
    }
  };

  const formatResults = (results: any) => {
    if (results.error) {
      return (
        <div className="text-red-500">
          <h3 className="text-xl font-semibold">Error</h3>
          <p>{results.error}</p>
        </div>
      );
    }

    return Object.entries(results).map(([key, value]) => (
      <div key={key} className="mb-4">
        <h3 className="text-xl font-semibold">{formatKey(key)}</h3>
        {key === 'html_structure' && typeof value === 'object' && value !== null
          ? renderHtmlStructure(value as Record<string, number>)
          : renderValue(value)}
      </div>
    ));
  };

  const formatKey = (key: string) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const renderHtmlStructure = (structure: Record<string, number>) => {
    const totalElements = Object.values(structure).reduce((sum, count) => sum + count, 0);
    const sortedElements = Object.entries(structure).sort((a, b) => b[1] - a[1]);
    const topElements = sortedElements.slice(0, 10);
    
    const calculatePercentage = (count: number) => ((count / totalElements) * 100).toFixed(2);

    return (
      <div>
        <p>Total HTML elements: {totalElements}</p>
        <h4 className="text-lg font-semibold mt-2">Top 10 most frequent elements:</h4>
        <ul className="list-disc list-inside">
          {topElements.map(([element, count]) => (
            <li key={element}>
              <code>{element}</code>: {count} ({calculatePercentage(count)}%)
            </li>
          ))}
        </ul>
        <h4 className="text-lg font-semibold mt-2">Structure Analysis:</h4>
        <ul className="list-disc list-inside">
          <li>Heading structure: {analyzeHeadings(structure)}</li>
          <li>Semantic elements: {analyzeSemanticElements(structure)}</li>
          <li>Interactive elements: {analyzeInteractiveElements(structure)}</li>
        </ul>
      </div>
    );
  };

  const analyzeHeadings = (structure: Record<string, number>) => {
    const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(h => structure[h] || 0);
    if (headings[0] === 0) return "No main heading (h1) found. This may impact SEO.";
    if (headings[0] > 1) return `Multiple h1 tags (${headings[0]}) found. Consider using only one main heading.`;
    return `Good heading structure. H1: ${headings[0]}, H2: ${headings[1]}, H3: ${headings[2]}, H4: ${headings[3]}, H5: ${headings[4]}, H6: ${headings[5]}`;
  };

  const analyzeSemanticElements = (structure: Record<string, number>) => {
    const semanticElements = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'];
    const usedElements = semanticElements.filter(el => structure[el] && structure[el] > 0);
    if (usedElements.length === 0) return "No semantic elements found. Consider using semantic HTML for better structure and SEO.";
    return `Semantic elements used: ${usedElements.join(', ')}. Good for accessibility and SEO.`;
  };

  const analyzeInteractiveElements = (structure: Record<string, number>) => {
    const interactiveElements = ['a', 'button', 'input', 'select', 'textarea'];
    const counts = interactiveElements.map(el => structure[el] || 0);
    return `Interactive elements: Links (${counts[0]}), Buttons (${counts[1]}), Inputs (${counts[2]}), Selects (${counts[3]}), Textareas (${counts[4]})`;
  };

  const renderValue = (value: any) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside">
          {value.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div className="pl-4">
{Object.entries(value).map(([subKey, subValue]) => (
  <div key={subKey}>
    <span className="font-semibold">{formatKey(subKey)}:</span>
    {React.isValidElement(subValue) ? subValue : String(subValue)}
  </div>
))}
        </div>
      );
    } else {
      return <p>{value}</p>;
    }
  };

  console.log("Rendering ResultsDisplay component");

  return (
    <div className="mt-4">
      {!results.analysis_results.error && (
        <>
          <h2 className="text-2xl font-bold mb-2">Architecture Diagram</h2>
          {diagramError ? (
            <p className="text-red-500">{diagramError}</p>
          ) : diagramSvg ? (
            <div
              className="bg-white p-4 rounded border border-gray-300"
              style={{ width: "100%", minHeight: "400px", overflow: "auto" }}
              dangerouslySetInnerHTML={{ __html: diagramSvg }}
            />
          ) : (
            <p>Loading diagram...</p>
          )}
        </>
      )}
      <h2 className="text-2xl font-bold mt-4 mb-2">Analysis Results</h2>
      {formatResults(results.analysis_results)}
    </div>
  );
};

export default ResultsDisplay;