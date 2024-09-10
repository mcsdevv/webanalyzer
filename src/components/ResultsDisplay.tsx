import React, { useEffect, useState, useCallback, useRef } from 'react';
import mermaid from 'mermaid';

// Types
type AnalysisResults = {
  error?: string;
  basic_info?: {
    title: string;
    description: string;
  };
  html_structure?: Record<string, number>;
  css_frameworks?: string[];
  javascript_libraries?: string[];
  server_technologies?: string[];
  hosting_provider?: string;
  cdn_provider?: string;
  cms?: string;
  ecommerce_platform?: string;
  seo_analysis?: Record<string, any>;
  security_analysis?: Record<string, any>;
  performance_analysis?: Record<string, any>;
  accessibility_analysis?: Record<string, any>;
  architecture?: string;
  marketing_technologies?: string[];
  social_links?: string[];
};

type ResultsDisplayProps = {
  results: {
    analysis_results: AnalysisResults;
    architecture_diagram: string;
  };
};

type SectionState = {
  [key: string]: boolean;
};
// Helper Components
const CollapsibleSection: React.FC<{ 
  title: string; 
  children: React.ReactNode; 
  isOpen: boolean;
  onToggle: () => void;
}> = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 ease-in-out">
      <button
        className="w-full text-left font-semibold text-lg p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
        onClick={onToggle}
      >
        <span className="transition-transform duration-200 ease-in-out transform" style={{ 
          transform: isOpen ? 'rotate(-180deg)' : 'rotate(0deg)'
        }}>▼</span>
        {title}
      </button>
      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '1000px' : '0px' }}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const ListSection: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="list-disc list-inside">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);
declare global {
  interface Window {
    clickHandler: (nodeId: string) => void;
  }
}

const ArchitectureDiagram: React.FC<{ diagram: string }> = ({ diagram }) => {
  const [diagramSvg, setDiagramSvg] = useState<string | null>(null);
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const renderDiagram = useCallback(async () => {
    try {
      mermaid.initialize({
        startOnLoad: true,
        securityLevel: 'loose',
        theme: 'default',
        flowchart: {
          useMaxWidth: false,
          htmlLabels: true,
        },
      });
      const { svg } = await mermaid.render('mermaid-diagram', diagram);
      setDiagramSvg(svg);
    } catch (error) {
      setDiagramError(`Failed to render the architecture diagram: ${error}`);
    }
  }, [diagram]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      fitDiagramToContainer();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (diagramSvg) {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(diagramSvg, 'image/svg+xml');
      svgRef.current = svgDoc.documentElement as unknown as SVGSVGElement;
      fitDiagramToContainer();
    }
  }, [diagramSvg]);

  const fitDiagramToContainer = () => {
    if (containerRef.current && svgRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const svgWidth = svgRef.current.viewBox.baseVal.width;
      const svgHeight = svgRef.current.viewBox.baseVal.height;

      const scaleX = containerWidth / svgWidth;
      const scaleY = containerHeight / svgHeight;
      const scale = Math.min(scaleX, scaleY, 1);

      setZoom(scale);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.1));
  const handleResetZoom = () => fitDiagramToContainer();

  if (diagramError) {
    return <p className="text-red-500">{diagramError}</p>;
  }

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <div className="absolute top-2 right-2 space-x-2 z-10">
        <button onClick={handleZoomIn} className="bg-blue-500 text-white px-2 py-1 rounded">+</button>
        <button onClick={handleZoomOut} className="bg-blue-500 text-white px-2 py-1 rounded">-</button>
        <button onClick={handleResetZoom} className="bg-blue-500 text-white px-2 py-1 rounded">Reset</button>
      </div>
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.3s ease-in-out',
          }}
          dangerouslySetInnerHTML={{ __html: diagramSvg || '' }}
        />
      </div>
    </div>
  );
};


const BasicInfo: React.FC<{ info: AnalysisResults['basic_info'] }> = ({ info }) => (
  <>
    {info?.title && <p><strong>Title:</strong> {info.title}</p>}
    {info?.description && <p><strong>Description:</strong> {info.description}</p>}
  </>
);

const HtmlStructure: React.FC<{ structure: Record<string, number> }> = ({ structure }) => {
  const totalElements = Object.values(structure).reduce((sum, count) => sum + count, 0);
  const topElements = Object.entries(structure)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <>
      <p>Total HTML elements: {totalElements}</p>
      <h4 className="font-semibold mt-2">Top 10 most frequent elements:</h4>
      <ul className="list-disc list-inside">
        {topElements.map(([element, count]) => (
          <li key={element}>
            <code>{element}</code>: {count} ({((count / totalElements) * 100).toFixed(2)}%)
          </li>
        ))}
      </ul>
    </>
  );
};

const GenericSection: React.FC<{ data: Record<string, any> }> = ({ data }) => (
  <ul className="list-disc list-inside">
    {Object.entries(data).map(([key, value]) => (
      <li key={key}>
        <code>{key}</code>: {JSON.stringify(value)}
      </li>
    ))}
  </ul>
);

// Helper function to check if content is empty, unknown, or an empty array
const isEmptyUnknownOrEmptyArray = (content: any): boolean => {
  if (Array.isArray(content)) {
    return content.length === 0;
  }
  if (typeof content === 'object' && content !== null) {
    return Object.keys(content).length === 0;
  }
  if (typeof content === 'string') {
    return content.trim() === '' || content.toLowerCase() === 'unknown';
  }
  return !content;
};

// Main Component
// Update the ResultsDisplay component to use the new ArchitectureDiagram
const ResultsDisplay: React.FC<ResultsDisplayProps> = React.memo(({ results }) => {
  const { analysis_results, architecture_diagram } = results;

  
  // Initialize sections state
  const initialSectionsState = Object.keys(analysis_results).reduce((acc, key) => {
    const content = analysis_results[key as keyof AnalysisResults];
    acc[key] = !isEmptyUnknownOrEmptyArray(content);
    return acc;
  }, {} as SectionState);

  const [sectionsState, setSectionsState] = useState<SectionState>(initialSectionsState);
  const [allExpanded, setAllExpanded] = useState(false);

  // Toggle all sections
  const toggleAllSections = () => {
    const newState = !allExpanded;
    setAllExpanded(newState);
    setSectionsState(Object.keys(sectionsState).reduce((acc, key) => {
      acc[key] = newState;
      return acc;
    }, {} as SectionState));
  };

  // Toggle individual section
  const toggleSection = (sectionKey: string) => {
    setSectionsState(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Update allExpanded state when individual sections change
  useEffect(() => {
    setAllExpanded(Object.values(sectionsState).every(Boolean));
  }, [sectionsState]);

  if (analysis_results.error) {
    return (
      <div className="text-red-500">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p>{analysis_results.error}</p>
      </div>
    );
  }

  const renderContent = (content: any) => {
    if (isEmptyUnknownOrEmptyArray(content)) {
      return 'No data available';
    }
    if (Array.isArray(content)) {
      return <ListSection items={content} />;
    }
    if (typeof content === 'object' && content !== null) {
      if (content.title && content.description) {
        return <BasicInfo info={content} />;
      }
      if ('html_structure' in content) {
        return <HtmlStructure structure={content.html_structure} />;
      }
      return <GenericSection data={content} />;
    }
    return content;
  };

  const gridSections = [
    { key: 'basic_info', title: 'Basic Information', content: analysis_results.basic_info },
    { key: 'hosting_provider', title: 'Hosting Provider', content: analysis_results.hosting_provider },
    { key: 'architecture', title: 'Architecture', content: analysis_results.architecture },
    { key: 'marketing_technologies', title: 'Marketing Technologies', content: analysis_results.marketing_technologies },
    { key: 'social_links', title: 'Social Links', content: analysis_results.social_links },
    { key: 'html_structure', title: 'HTML Structure', content: analysis_results.html_structure },
    { key: 'css_frameworks', title: 'CSS Frameworks', content: analysis_results.css_frameworks },
    { key: 'javascript_libraries', title: 'JavaScript Libraries', content: analysis_results.javascript_libraries },
    { key: 'server_technologies', title: 'Server Technologies', content: analysis_results.server_technologies },
    { key: 'cdn_provider', title: 'CDN Provider', content: analysis_results.cdn_provider },
    { key: 'cms', title: 'CMS', content: analysis_results.cms },
    { key: 'ecommerce_platform', title: 'E-commerce Platform', content: analysis_results.ecommerce_platform },
    { key: 'seo_analysis', title: 'SEO Analysis', content: analysis_results.seo_analysis },
    { key: 'security_analysis', title: 'Security Analysis', content: analysis_results.security_analysis },
    { key: 'performance_analysis', title: 'Performance Analysis', content: analysis_results.performance_analysis },
    { key: 'accessibility_analysis', title: 'Accessibility Analysis', content: analysis_results.accessibility_analysis },
  ].sort((a, b) => {
    if (!isEmptyUnknownOrEmptyArray(a.content) && isEmptyUnknownOrEmptyArray(b.content)) return -1;
    if (isEmptyUnknownOrEmptyArray(a.content) && !isEmptyUnknownOrEmptyArray(b.content)) return 1;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-4">Website Analysis Results</h1>
      <div className="mb-4 h-[50vh]">
        <ArchitectureDiagram diagram={architecture_diagram} />
      </div>
      <div className="mb-4">
        <button 
          onClick={toggleAllSections} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
        >
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
        {gridSections.map((section) => (
          <div key={section.key} className="contents">
            <CollapsibleSection 
              title={section.title}
              isOpen={sectionsState[section.key]}
              onToggle={() => toggleSection(section.key)}
            >
              <div className="break-words">
                {renderContent(section.content)}
              </div>
            </CollapsibleSection>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ResultsDisplay;