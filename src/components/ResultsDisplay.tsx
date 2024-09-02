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
      seo_analysis: Record<string, any>;
      security_analysis: Record<string, any>;
      performance_analysis: Record<string, any>;
      accessibility_analysis: Record<string, any>;
    };
    architecture_diagram: string;
  };
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
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
    const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const headingCounts = headings.map(heading => structure[heading] || 0);
    const totalHeadings = headingCounts.reduce((sum, count) => sum + count, 0);
  
    if (totalHeadings === 0) {
      return 'No headings found';
    }
  
    const headingRatio = headingCounts.map(count => ((count / totalHeadings) * 100).toFixed(2));
    const mostCommonHeading = headings[headingCounts.indexOf(Math.max(...headingCounts))];
  
    return `Total headings: ${totalHeadings}, Most common heading: ${mostCommonHeading} (${headingRatio}%)`;
  };
  
  const analyzeSemanticElements = (structure: Record<string, number>) => {
    const semanticElements = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
    const semanticElementCounts = semanticElements.map(element => structure[element] || 0);
    const totalSemanticElements = semanticElementCounts.reduce((sum, count) => sum + count, 0);
  
    if (totalSemanticElements === 0) {
      return 'No semantic elements found';
    }
  
    return `Total semantic elements: ${totalSemanticElements}`;
  };
  
  const analyzeInteractiveElements = (structure: Record<string, number>) => {
    const interactiveElements = ['a', 'button', 'input', 'select', 'textarea'];
    const interactiveElementCounts = interactiveElements.map(element => structure[element] || 0);
    const totalInteractiveElements = interactiveElementCounts.reduce((sum, count) => sum + count, 0);
  
    if (totalInteractiveElements === 0) {
      return 'No interactive elements found';
    }
  
    return `Total interactive elements: ${totalInteractiveElements}`;
  };
  
  const renderValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <ul className="list-disc list-inside">
          {Object.entries(value).map(([key, val]) => (
            <li key={key}>
              <code>{key}</code>: {renderValue(val)}
            </li>
          ))}
        </ul>
      );
    }
  
    return <code>{String(value)}</code>;
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      {diagramSvg && (
        <div className="mt-4" ref={mermaidRef}>
          <h2 className="text-2xl font-semibold mb-2">Architecture Diagram</h2>
          <div dangerouslySetInnerHTML={{ __html: diagramSvg }} />
        </div>
      )}
      {diagramError && (
        <div className="mt-4 text-red-500">
          <h2 className="text-2xl font-semibold mb-2">Error rendering diagram</h2>
          <p>{diagramError}</p>
        </div>
      )}
      <h1 className="text-3xl font-semibold mb-4">Website Analysis Results</h1>
      {formatResults(results.analysis_results)}
    </div>
  );
  };
  
  export default ResultsDisplay;