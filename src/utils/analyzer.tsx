import axios, { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';
import { JSDOM } from 'jsdom';
import { resolve } from 'dns';
import * as dns from 'dns';
import { URL } from 'url';


export async function analyzeWebsite(url: string) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      maxRedirects: 5,
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const parser = dom.window.DOMParser;
    const hostingProvider = await detectHostingProvider(response.headers, url, response.data);

    const analysis = {
      html_structure: analyzeHtmlStructure(document),
      css_frameworks: detectCssFrameworks(response.data, document),
      javascript_libraries: detectJavascriptLibraries(response.data, document),
      server_technologies: detectServerTechnologies(response.headers),
      hosting_provider: hostingProvider,
      cdn_provider: detectCdnProvider(response.headers),
      cms: detectCMS(response.data, document),
      ecommerce_platform: detectEcommercePlatform(response.data, document),
      seo_analysis: analyzeSEO(document),
      security_analysis: analyzeSecurity(response.headers),
      performance_analysis: analyzePerformance(response.headers),
      accessibility_analysis: analyzeAccessibility(document),
    };

    const architectureDiagram = generateArchitectureDiagram(analysis);

    return {
      analysis_results: analysis,
      architecture_diagram: architectureDiagram,
    };
  } catch (error) {
    console.error('Error analyzing website:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`HTTP error ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response received from the server. The website might be down or blocking our requests.');
      }
    }
    throw new Error('An unexpected error occurred while analyzing the website.');
  }
}

// ... (rest of the code remains the same)


function analyzeSecurity(headers: AxiosResponseHeaders | RawAxiosResponseHeaders): Record<string, any> {
  return {
    https: headers['strict-transport-security'] ? true : false,
    sslTLS: headers['content-security-policy'] ? true : false,
    securityHeaders: Object.keys(headers).filter(header => header.startsWith('security-')),
  };
}

function analyzePerformance(headers: AxiosResponseHeaders | RawAxiosResponseHeaders): Record<string, any> {
  return {
    cacheControl: headers['cache-control'],
    expires: headers['expires'],
    contentEncoding: headers['content-encoding'],
    transferEncoding: headers['transfer-encoding'],
  };
}

function analyzeSEO(document: Document): Record<string, any> {
  return {
    metaTitle: document.title,
    metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content'),
    metaKeywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content'),
    headerTags: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(header => header.textContent),
    imageAltTags: Array.from(document.querySelectorAll('img')).map(image => image.alt),
    internalLinks: Array.from(document.querySelectorAll('a')).filter(link => link.href && link.href.startsWith('/')).map(link => link.href),
    externalLinks: Array.from(document.querySelectorAll('a')).filter(link => link.href && link.href.startsWith('http')).map(link => link.href),
  };
}

function analyzeAccessibility(document: Document): Record<string, any> {
  return {
    semanticHTML: document.querySelectorAll('header, nav, main, section, article, aside, footer').length > 0,
    altTextForImages: Array.from(document.querySelectorAll('img')).every(image => image.alt),
    descriptiveLinkText: Array.from(document.querySelectorAll('a')).every(link => link.textContent.trim() !== ''),
  };
}
function analyzeHtmlStructure(doc: Document): Record<string, number> {
  const structure: Record<string, number> = {};
  const elements = doc.getElementsByTagName('*');
  for (const element of elements) {
    const tagName = element.tagName.toLowerCase();
    structure[tagName] = (structure[tagName] || 0) + 1;
  }
  return structure;
}

function detectCssFrameworks(html: string, doc: Document): string[] {
  const frameworks = [];
  if (html.includes('bootstrap') || doc.querySelector('link[href*="bootstrap"]')) frameworks.push('Bootstrap');
  if (html.includes('tailwind') || doc.querySelector('link[href*="tailwind"]')) frameworks.push('Tailwind CSS');
  if (html.includes('bulma') || doc.querySelector('link[href*="bulma"]')) frameworks.push('Bulma');
  if (html.includes('foundation') || doc.querySelector('link[href*="foundation"]')) frameworks.push('Foundation');
  if (html.includes('materialize') || doc.querySelector('link[href*="materialize"]')) frameworks.push('Materialize');
  if (html.includes('semantic-ui') || doc.querySelector('link[href*="semantic-ui"]')) frameworks.push('Semantic UI');
  return frameworks;
}

function detectJavascriptLibraries(html: string, doc: Document): string[] {
  const libraries = [];
  if (html.includes('react') || doc.querySelector('script[src*="react"]')) libraries.push('React');
  if (html.includes('jquery') || doc.querySelector('script[src*="jquery"]')) libraries.push('jQuery');
  if (html.includes('vue') || doc.querySelector('script[src*="vue"]')) libraries.push('Vue.js');
  if (html.includes('angular') || doc.querySelector('script[src*="angular"]')) libraries.push('Angular');
  if (html.includes('lodash') || doc.querySelector('script[src*="lodash"]')) libraries.push('Lodash');
  if (html.includes('moment') || doc.querySelector('script[src*="moment"]')) libraries.push('Moment.js');
  if (html.includes('axios') || doc.querySelector('script[src*="axios"]')) libraries.push('Axios');
  return libraries;
}

function detectServerTechnologies(headers: AxiosResponseHeaders | RawAxiosResponseHeaders): string[] {
  const technologies = [];
  const server = headers['server'] as string | undefined;
  if (server) {
    if (server.includes('Apache')) technologies.push('Apache');
    if (server.includes('nginx')) technologies.push('Nginx');
    if (server.includes('IIS')) technologies.push('IIS');
    if (server.includes('LiteSpeed')) technologies.push('LiteSpeed');
  }
  const poweredBy = headers['x-powered-by'] as string | undefined;
  if (poweredBy) {
    if (poweredBy.includes('PHP')) technologies.push('PHP');
    if (poweredBy.includes('ASP.NET')) technologies.push('ASP.NET');
    if (poweredBy.includes('Express')) technologies.push('Express.js');
  }
  if (headers['x-aspnet-version']) technologies.push('ASP.NET');
  if (headers['x-rails-version']) technologies.push('Ruby on Rails');
  return technologies;
}


function detectHostingProvider(headers: any, url: string, html: string): Promise<string> {
  const hostingProviders = [
    { name: 'GitHub Pages', headers: ['server*="GitHub.com"'], url: ['github.io'], dns: ['github.com'] },
    { name: 'Squarespace', headers: ['server*="Squarespace"'], url: [], dns: ['squarespace.com'] },
    { name: 'Wix', headers: ['x-wix-request-id'], url: [], dns: ['wix.com'] },
    { name: 'Shopify', headers: ['x-shopify-stage'], url: [], dns: ['shopify.com'] },
    { name: 'Heroku', url: ['herokuapp.com'], dns: ['heroku.com'] },
    { name: 'Netlify', url: ['netlify.app'], dns: ['netlify.com'] },
    { name: 'Vercel', url: ['vercel.app'], dns: ['vercel.com', 'cname.vercel-dns.com'], },
    { name: 'WP Engine', url: ['wpengine.com'], dns: ['wpengine.com'] },
    { name: 'Cloudflare Pages', url: ['cloudflarestore.com'], dns: ['cloudflare.com'] },
    { name: 'Microsoft Azure', url: ['azurewebsites.net'], dns: ['azure.com'] },
    { name: 'Amazon Web Services', url: ['amazonaws.com'], dns: ['amazonaws.com'] },
    { name: 'WordPress', html: ['wp-content'] },
  ];

 
  return new Promise((resolve, reject) => {
    const domain = new URL(url).hostname;

    // First, check headers, url, and html for a match
    for (const provider of hostingProviders) {
      if (provider.headers && provider.headers.some((header) => headers[header.split('*')[0]] && headers[header.split('*')[0]].includes(header.split('*')[1]))) {
        return resolve(provider.name);
      } else if (provider.url && provider.url.some((urlPart) => url.includes(urlPart))) {
        return resolve(provider.name);
      } else if (provider.html && provider.html.some((htmlPart) => html.includes(htmlPart))) {
        return resolve(provider.name);
      }
    }

    // If no match, proceed with DNS lookups
    async function resolveDns(domain) {
      try {
        const addresses = await dns.promises.resolve(domain);
        console.log(`A records: ${addresses.join(', ')}`);

        const nsRecords = await dns.promises.resolveNs(domain);
        console.log(`NS records: ${nsRecords.join(', ')}`);

        // Verify hosting provider using NS records
        for (const provider of hostingProviders) {
          if (provider.dns && nsRecords.some((nsRecord) => provider.dns.includes(nsRecord))) {
            return provider.name;
          }
        }

        // If no match, continue with other DNS records
        const mxRecords = await dns.promises.resolveMx(domain);
        console.log(`MX records: ${mxRecords.map((record) => record.exchange).join(', ')}`);

        const cnameRecords = await dns.promises.resolveCname(domain);
        console.log(`CNAME records: ${cnameRecords.join(', ')}`);

        // Check DNS records for a match
        for (const provider of hostingProviders) {
          const dnsMatch = provider.dns && (
            addresses.some((address) => provider.dns.includes(address))
            || mxRecords.some((mxRecord) => provider.dns.includes(mxRecord.exchange))
            || cnameRecords.some((cname) => provider.dns.includes(cname))
          );
          if (dnsMatch) {
            return provider.name;
          }
        }

        // If no match, return 'Unknown'
        return 'Unknown';
      } catch (err) {
        console.error(`DNS query error: ${err.message}`);
        return 'Unknown';
      }
    };
  }
);
}

function detectCdnProvider(headers: AxiosResponseHeaders | RawAxiosResponseHeaders): string {
  if (headers['x-cdn'] === 'Cloudflare' || headers['cf-ray']) return 'Cloudflare';
  if (headers['x-amz-cf-id']) return 'Amazon CloudFront';
  if (headers['x-fastly-request-id']) return 'Fastly';
  if (headers['x-akamai-transformed']) return 'Akamai';
  if (headers['x-cache-status'] && (headers['x-cache-status'] as string).includes('HIT')) return 'Varnish';
  if (headers['x-cdn-provider']) return headers['x-cdn-provider'] as string;
  return 'Unknown';
}

function detectCMS(html: string, doc: Document): string {
  if (html.includes('wp-content') || doc.querySelector('meta[name="generator"][content*="WordPress"]')) return 'WordPress';
  if (html.includes('Drupal') || doc.querySelector('meta[name="generator"][content*="Drupal"]')) return 'Drupal';
  if (html.includes('Joomla') || doc.querySelector('meta[name="generator"][content*="Joomla"]')) return 'Joomla';
  if (html.includes('ghost') || doc.querySelector('meta[name="generator"][content*="Ghost"]')) return 'Ghost';
  if (html.includes('contentful') || doc.querySelector('meta[name="generator"][content*="Contentful"]')) return 'Contentful';
  return 'Unknown';
}

function detectEcommercePlatform(html: string, doc: Document): string {
  if (html.includes('shopify') || doc.querySelector('link[href*="shopify"]')) return 'Shopify';
  if (html.includes('magento') || doc.querySelector('script[src*="magento"]')) return 'Magento';
  if (html.includes('woocommerce') || doc.querySelector('link[href*="woocommerce"]')) return 'WooCommerce';
  if (html.includes('bigcommerce') || doc.querySelector('link[rel="stylesheet"][href*="bigcommerce.com"]')) return 'BigCommerce';
  if (html.includes('prestashop') || doc.querySelector('meta[name="generator"][content*="PrestaShop"]')) return 'PrestaShop';
  return 'Unknown';
}

function generateArchitectureDiagram(analysis: any): string {
  console.log('Generating architecture diagram...');
  try {
  let diagram = 'graph TD\n';
  diagram += '  A[Client] --> B[Website]\n';
  
  let nodeId = 1;
  const getNextId = () => {
    return `N${nodeId++}`;
  };


  const addNodes = (parentId: string, items: string[], label: string) => {
    if (items && items.length > 0) {
      const id = getNextId();
      diagram += `  ${parentId} --> ${id}[${label}]\n`;
      items.forEach((item, index) => {
        const itemId = getNextId();
        diagram += `  ${id} --> ${itemId}["${item.replace(/"/g, "'")}"]\n`;
      });
    }
  };

  addNodes('B', analysis.css_frameworks, 'CSS Frameworks');
  addNodes('B', analysis.javascript_libraries, 'JavaScript Libraries');
  addNodes('B', analysis.server_technologies, 'Server Technologies');
  
  if (analysis.hosting_provider && analysis.hosting_provider !== 'Unknown') {
    diagram += `  B --> ${getNextId()}["Hosting: ${analysis.hosting_provider.replace(/"/g, "'")}"]\n`;
  }
  
  if (analysis.cdn_provider && analysis.cdn_provider !== 'Unknown') {
    diagram += `  B --> ${getNextId()}["CDN: ${(analysis.cdn_provider as string).replace(/"/g, "'")}"]\n`;
  }
  
  if (analysis.cms && analysis.cms !== 'Unknown') {
    diagram += `  B --> ${getNextId()}["CMS: ${(analysis.cms as string).replace(/"/g, "'")}"]\n`;
  }
  

  if (analysis.ecommerce_platform && analysis.ecommerce_platform !== 'Unknown') {
    diagram += `  B --> ${getNextId()}["E-commerce: ${analysis.ecommerce_platform.replace(/"/g, "'")}"]\n`;
  }
  
  console.log('ADiagram generated:', diagram);
  return diagram;
} catch (error) {
  console.error('Error generating architecture diagram:', error);
  return '';
}
}