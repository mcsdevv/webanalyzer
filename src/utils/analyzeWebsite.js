import axios from 'axios';
import { JSDOM } from 'jsdom';
import { URL } from 'url';
import * as https from 'https';
export async function analyzeWebsite(url, options) {
    try {
        const axiosConfig = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            maxRedirects: 5,
            httpsAgent: new https.Agent({ rejectUnauthorized: options.rejectUnauthorized }),
        };
        const response = await axios.get(url, axiosConfig);
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        const hostingProvider = await detectHostingProvider(url);
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
            architecture: detectArchitecture(response.data, document),
            marketing_technologies: detectMarketingTechnologies(response.data, document),
            social_links: detectSocialLinks(document),
        };
        const architectureDiagram = generateArchitectureDiagram(analysis);
        return {
            analysis_results: analysis,
            architecture_diagram: architectureDiagram,
        };
    }
    catch (error) {
        console.error('Error analyzing website:', error);
        if (axios.isAxiosError(error)) {
            if (error.response) {
                throw new Error(`HTTP error ${error.response.status}: ${error.response.statusText}`);
            }
            else if (error.request) {
                throw new Error('No response received from the server. The website might be down or blocking our requests.');
            }
        }
        // Detailed error logging
        if (error instanceof Error) {
            const errorMessage = error.message;
            const errorStack = error.stack;
            console.error('Error details:', { message: errorMessage, stack: errorStack });
            throw new Error(`An unexpected error occurred while analyzing the website: ${errorMessage}`);
        }
        throw new Error('An unexpected error occurred while analyzing the website.');
    }
}
// Security Analysis
function analyzeSecurity(headers) {
    return {
        https: headers['strict-transport-security'] ? true : false,
        sslTLS: headers['content-security-policy'] ? true : false,
        securityHeaders: Object.keys(headers).filter(header => header.startsWith('security-')),
    };
}
// Performance Analysis
function analyzePerformance(headers) {
    return {
        cacheControl: headers['cache-control'],
        expires: headers['expires'],
        contentEncoding: headers['content-encoding'],
        transferEncoding: headers['transfer-encoding'],
    };
}
// SEO Analysis
function analyzeSEO(document) {
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
// Accessibility Analysis
function analyzeAccessibility(document) {
    return {
        semanticHTML: document.querySelectorAll('header, nav, main, section, article, aside, footer').length > 0,
        altTextForImages: Array.from(document.querySelectorAll('img')).every(image => image.alt),
        descriptiveLinkText: Array.from(document.querySelectorAll('a')).every(link => link.textContent.trim() !== ''),
    };
}
// HTML Structure Analysis
function analyzeHtmlStructure(doc) {
    const structure = {};
    const elements = doc.getElementsByTagName('*');
    for (const element of elements) {
        const tagName = element.tagName.toLowerCase();
        structure[tagName] = (structure[tagName] || 0) + 1;
    }
    return structure;
}
// CSS Framework Detection
function detectCssFrameworks(html, doc) {
    const frameworks = [];
    const cssFrameworks = [
        { name: 'Bootstrap', keyword: 'bootstrap' },
        { name: 'Tailwind CSS', keyword: 'tailwind' },
        { name: 'Bulma', keyword: 'bulma' },
        { name: 'Foundation', keyword: 'foundation' },
        { name: 'Materialize', keyword: 'materialize' },
        { name: 'Semantic UI', keyword: 'semantic-ui' },
    ];
    cssFrameworks.forEach(({ name, keyword }) => {
        if (html.includes(keyword) || doc.querySelector(`link[href*="${keyword}"]`)) {
            frameworks.push(name);
        }
    });
    return frameworks;
}
// JavaScript Library Detection
function detectJavascriptLibraries(html, doc) {
    const libraries = [];
    const jsLibraries = [
        { name: 'React', keyword: 'react' },
        { name: 'jQuery', keyword: 'jquery' },
        { name: 'Vue.js', keyword: 'vue' },
        { name: 'Angular', keyword: 'angular' },
        { name: 'Lodash', keyword: 'lodash' },
        { name: 'Moment.js', keyword: 'moment' },
        { name: 'Axios', keyword: 'axios' },
        { name: 'D3.js', keyword: 'd3' },
    ];
    jsLibraries.forEach(({ name, keyword }) => {
        if (html.includes(keyword) || doc.querySelector(`script[src*="${keyword}"]`)) {
            libraries.push(name);
        }
    });
    return libraries;
}
// Server Technology Detection
function detectServerTechnologies(headers) {
    const technologies = [];
    const server = headers['server'];
    if (server) {
        if (server.includes('Apache'))
            technologies.push('Apache');
        if (server.includes('nginx'))
            technologies.push('Nginx');
        if (server.includes('IIS'))
            technologies.push('IIS');
        if (server.includes('LiteSpeed'))
            technologies.push('LiteSpeed');
    }
    const poweredBy = headers['x-powered-by'];
    if (poweredBy) {
        if (poweredBy.includes('PHP'))
            technologies.push('PHP');
        if (poweredBy.includes('ASP.NET'))
            technologies.push('ASP.NET');
        if (poweredBy.includes('Express'))
            technologies.push('Express.js');
    }
    if (headers['x-aspnet-version'])
        technologies.push('ASP.NET');
    if (headers['x-rails-version'])
        technologies.push('Ruby on Rails');
    if (headers['via'] && headers['via'].includes('cloudflare'))
        technologies.push('Cloudflare');
    return technologies;
}
// Detect Website Architecture (SPA, MPA, SSG, SSR)
function detectArchitecture(html, doc) {
    // Check for Server-Side Rendering (SSR)
    if (doc.querySelector('script[src*="next"]') || html.includes('__NEXT_DATA__')) {
        return 'SSR (Server-Side Rendering)';
    }
    // Check for Static Site Generation (SSG)
    if (doc.querySelector('script[src*="gatsby"]') || doc.querySelector('meta[content="Gatsby"]')) {
        return 'SSG (Static Site Generation)';
    }
    if (doc.querySelector('script[src*="jekyll"]') || doc.querySelector('meta[content="Jekyll"]')) {
        return 'SSG (Static Site Generation)';
    }
    if (doc.querySelector('script[src*="hugo"]') || doc.querySelector('meta[content="Hugo"]')) {
        return 'SSG (Static Site Generation)';
    }
    // Check for Single Page Application (SPA)
    if (doc.querySelector('script[src*="single-spa"]') || doc.querySelector('script[src*="react"]') || html.includes('window.__INITIAL_STATE__')) {
        return 'SPA (Single Page Application)';
    }
    if (doc.querySelector('script[src*="angular"]') || html.includes('ng-version')) {
        return 'SPA (Single Page Application)';
    }
    if (doc.querySelector('script[src*="vue"]') || html.includes('window.__INITIAL_STATE__')) {
        return 'SPA (Single Page Application)';
    }
    // Default to Multi-Page Application (MPA)
    return 'MPA (Multi-Page Application)';
}
// Marketing Technologies Detection
function detectMarketingTechnologies(html, doc) {
    const marketingTechs = [];
    const techs = [
        { name: 'Google Analytics', keyword: 'google-analytics', regex: /analytics\.js/ },
        { name: 'Google Tag Manager', keyword: 'gtm', regex: /gtm\.js/ },
        { name: 'Facebook Pixel', keyword: 'fbevents', regex: /fbevents\.js/ },
        { name: 'Hotjar', keyword: 'hotjar', regex: /static\.hotjar\.com/ },
        { name: 'HubSpot', keyword: 'hubspot', regex: /js\.hubspot\.com/ },
        { name: 'Marketo', keyword: 'marketo', regex: /marketo\.com/ },
        { name: 'Salesforce', keyword: 'salesforce', regex: /salesforce\.com/ },
        { name: 'Mixpanel', keyword: 'mixpanel', regex: /cdn\.mixpanel\.com/ },
        { name: 'Crazy Egg', keyword: 'crazyegg', regex: /crazyegg\.com/ },
        { name: 'Intercom', keyword: 'intercom', regex: /intercom\.io/ },
        { name: 'Kissmetrics', keyword: 'kissmetrics', regex: /i\.kissmetrics\.com/ },
    ];
    techs.forEach(({ name, keyword, regex }) => {
        if (html.includes(keyword) || doc.querySelector(`script[src*="${keyword}"]`) || regex.test(html)) {
            marketingTechs.push(name);
        }
    });
    return marketingTechs;
}
// Social Links Detection
function detectSocialLinks(doc) {
    const socialLinks = [];
    const socialPlatforms = [
        'facebook.com',
        'twitter.com',
        'linkedin.com',
        'instagram.com',
        'youtube.com',
        'tiktok.com',
    ];
    socialPlatforms.forEach((platform) => {
        const links = Array.from(doc.querySelectorAll(`a[href*="${platform}"]`)).map(link => link.getAttribute('href'));
    });
    return socialLinks;
}
// Hosting Provider Detection
async function detectHostingProvider(url) {
    const apiKey = "wu4prqwwhtubn2999uxru4voyt903eflke963sow5mzso0x50j53uzl11w337q4gbxx6m9"; // Your API key
    const domain = new URL(url).hostname;
    console.debug("API Key:", apiKey);
    console.debug("Domain extracted from URL:", domain);
    try {
        // Call the Who Hosts This API
        const response = await axios.get(`https://www.who-hosts-this.com/API/Host`, {
            params: {
                key: apiKey,
                url: domain,
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        });
        console.debug("API Response:", response.data);
        const { result, results } = response.data;
        console.debug("Result object from API response:", result);
        console.debug("Results array from API response:", results);
        if (result.code === 200 && results && results.length > 0) {
            // Assuming we want to return the ISP name
            const ispName = results[0].isp_name;
            console.debug("ISP Name found:", ispName);
            return `Provider: ${ispName}`;
        }
        else {
            console.error('No hosting provider found in API response:', response.data);
            return 'unable to find provider';
        }
    }
    catch (error) {
        console.error('Error calling Who Hosts This API:', error);
        return 'Host Finder Error'; // Fallback if API call fails
    }
}
// CDN Provider Detection
function detectCdnProvider(headers) {
    if (headers['x-cdn'] === 'Cloudflare' || headers['cf-ray'])
        return 'Cloudflare';
    if (headers['x-amz-cf-id'])
        return 'Amazon CloudFront';
    if (headers['x-fastly-request-id'])
        return 'Fastly';
    if (headers['x-akamai-transformed'])
        return 'Akamai';
    if (headers['x-cache-status'] && headers['x-cache-status'].includes('HIT'))
        return 'Varnish';
    if (headers['x-cdn-provider'])
        return headers['x-cdn-provider'];
    return 'Unknown';
}
// CMS Detection
function detectCMS(html, doc) {
    if (html.includes('wp-content') || doc.querySelector('meta[name="generator"][content*="WordPress"]'))
        return 'WordPress';
    if (html.includes('Drupal') || doc.querySelector('meta[name="generator"][content*="Drupal"]'))
        return 'Drupal';
    if (html.includes('Joomla') || doc.querySelector('meta[name="generator"][content*="Joomla"]'))
        return 'Joomla';
    if (html.includes('ghost') || doc.querySelector('meta[name="generator"][content*="Ghost"]'))
        return 'Ghost';
    if (html.includes('contentful') || doc.querySelector('meta[name="generator"][content*="Contentful"]'))
        return 'Contentful';
    if (html.includes('hubspot') || doc.querySelector('meta[name="generator"][content*="HubSpot"]'))
        return 'HubSpot';
    return 'Unknown';
}
// E-commerce Platform Detection
function detectEcommercePlatform(html, doc) {
    if (html.includes('shopify') || doc.querySelector('link[href*="shopify"]'))
        return 'Shopify';
    if (html.includes('magento') || doc.querySelector('script[src*="magento"]'))
        return 'Magento';
    if (html.includes('woocommerce') || doc.querySelector('link[href*="woocommerce"]'))
        return 'WooCommerce';
    if (html.includes('bigcommerce') || doc.querySelector('link[rel="stylesheet"][href*="bigcommerce.com"]'))
        return 'BigCommerce';
    if (html.includes('prestashop') || doc.querySelector('meta[name="generator"][content*="PrestaShop"]'))
        return 'PrestaShop';
    return 'Unknown';
}
// Generate Architecture Diagram
function generateArchitectureDiagram(analysis) {
    try {
        let diagram = 'graph TD\n';
        diagram += '  A[Client] --> B[Website]\n';
        let nodeId = 1;
        const getNextId = () => {
            return `N${nodeId++}`;
        };
        const addNodes = (parentId, items, label) => {
            if (items && items.length > 0) {
                const id = getNextId();
                diagram += `  ${parentId} --> ${id}[${label}]\n`;
                items.forEach((item) => {
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
            diagram += `  B --> ${getNextId()}["CDN: ${analysis.cdn_provider.replace(/"/g, "'")}"]\n`;
        }
        if (analysis.cms && analysis.cms !== 'Unknown') {
            diagram += `  B --> ${getNextId()}["CMS: ${analysis.cms.replace(/"/g, "'")}"]\n`;
        }
        if (analysis.ecommerce_platform && analysis.ecommerce_platform !== 'Unknown') {
            diagram += `  B --> ${getNextId()}["E-commerce: ${analysis.ecommerce_platform.replace(/"/g, "'")}"]\n`;
        }
        if (analysis.architecture && analysis.architecture !== 'Unknown') {
            diagram += `  B --> ${getNextId()}["Architecture: ${analysis.architecture.replace(/"/g, "'")}"]\n`;
        }
        if (analysis.marketing_technologies && analysis.marketing_technologies.length > 0) {
            addNodes('B', analysis.marketing_technologies, 'Marketing Technologies');
        }
        // Add clickable social links node
        if (analysis.social_links && analysis.social_links.length > 0) {
            const socialLinksNode = getNextId();
            diagram += `  B --> ${socialLinksNode}[Social Links]\n`;
            analysis.social_links.forEach((link) => {
                const socialLinkId = getNextId();
                diagram += `  ${socialLinksNode} --> ${socialLinkId}["<a href='${link}' target='_blank'>${link}</a>"]\n`;
            });
        }
        diagram += `  B --> ${getNextId()}[SEO Analysis]\n`;
        diagram += `  B --> ${getNextId()}[Security Analysis]\n`;
        diagram += `  B --> ${getNextId()}[Performance Analysis]\n`;
        diagram += `  B --> ${getNextId()}[Accessibility Analysis]\n`;
        console.log('Diagram generated:', diagram);
        return diagram;
    }
    catch (error) {
        console.error('Error generating architecture diagram:', error);
        return '';
    }
}
