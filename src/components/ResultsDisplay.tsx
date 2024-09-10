import React, { useEffect, useState } from 'react';
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

// Helper Components
const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <button
        className="w-full text-left font-semibold text-lg mb-2 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <span>{isOpen ? '▼' : '►'}</span>
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
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

const ArchitectureDiagram: React.FC<{ diagram: string }> = ({ diagram }) => {
  const [diagramSvg, setDiagramSvg] = useState<string | null>(null);
  const [diagramError, setDiagramError] = useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render('mermaid-diagram', diagram);
        setDiagramSvg(svg);
      } catch (error) {
        setDiagramError(`Failed to render the architecture diagram: ${error}`);
      }
    };

    mermaid.initialize({ startOnLoad: true, securityLevel: 'loose', theme: 'default' });
    renderDiagram();
  }, [diagram]);

  if (diagramError) {
    return <p className="text-red-500">{diagramError}</p>;
  }

  return diagramSvg ? <div dangerouslySetInnerHTML={{ __html: diagramSvg }} /> : null;
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

// Main Component
const ResultsDisplay: React.FC<ResultsDisplayProps> = React.memo(({ results }) => {
  const { analysis_results, architecture_diagram } = results;

  if (analysis_results.error) {
    return (
      <div className="text-red-500">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p>{analysis_results.error}</p>
      </div>
    );
  }

  const gridSections = [
    { title: 'Architecture Diagram', content: <ArchitectureDiagram diagram={architecture_diagram} />, size: 'col-span-2' },
    { title: 'Basic Information', content: analysis_results.basic_info && <BasicInfo info={analysis_results.basic_info} />, size: 'col-span-1' },
    { title: 'Hosting Provider', content: analysis_results.hosting_provider, size: 'col-span-1' },
    { title: 'Architecture', content: analysis_results.architecture, size: 'col-span-1' },
    { title: 'Marketing Technologies', content: analysis_results.marketing_technologies && <ListSection items={analysis_results.marketing_technologies} />, size: 'col-span-1' },
    { title: 'Social Links', content: analysis_results.social_links && <ListSection items={analysis_results.social_links} />, size: 'col-span-1' },
    { title: 'HTML Structure', content: analysis_results.html_structure && <HtmlStructure structure={analysis_results.html_structure} />, size: 'col-span-2' },
    { title: 'CSS Frameworks', content: analysis_results.css_frameworks && <ListSection items={analysis_results.css_frameworks} />, size: 'col-span-1' },
    { title: 'JavaScript Libraries', content: analysis_results.javascript_libraries && <ListSection items={analysis_results.javascript_libraries} />, size: 'col-span-1' },
    { title: 'Server Technologies', content: analysis_results.server_technologies && <ListSection items={analysis_results.server_technologies} />, size: 'col-span-1' },
    { title: 'CDN Provider', content: analysis_results.cdn_provider, size: 'col-span-1' },
    { title: 'CMS', content: analysis_results.cms, size: 'col-span-1' },
    { title: 'E-commerce Platform', content: analysis_results.ecommerce_platform, size: 'col-span-1' },
    { title: 'SEO Analysis', content: analysis_results.seo_analysis && <GenericSection data={analysis_results.seo_analysis} />, size: 'col-span-1' },
    { title: 'Security Analysis', content: analysis_results.security_analysis && <GenericSection data={analysis_results.security_analysis} />, size: 'col-span-1' },
    { title: 'Performance Analysis', content: analysis_results.performance_analysis && <GenericSection data={analysis_results.performance_analysis} />, size: 'col-span-1' },
    { title: 'Accessibility Analysis', content: analysis_results.accessibility_analysis && <GenericSection data={analysis_results.accessibility_analysis} />, size: 'col-span-1' },
  ].filter(section => section.content);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-4">Website Analysis Results</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gridSections.map((section, index) => (
          <div key={index} className={section.size}>
            <CollapsibleSection title={section.title}>
              {section.content}
            </CollapsibleSection>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ResultsDisplay;