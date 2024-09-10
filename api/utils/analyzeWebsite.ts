import axios, { AxiosRequestConfig, AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";
import { JSDOM } from "jsdom";
import { URL } from "url";
import * as https from "https";
import { performance } from "perf_hooks";

export async function analyzeWebsite(
  url: string,
  options: { rejectUnauthorized: boolean }
) {
  try {
    // Log the URL and options passed to the function
    console.log("Analyzing URL:", url, "with options:", options);

    const startTime = performance.now();

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      maxRedirects: 5,
      httpsAgent: new https.Agent({
        rejectUnauthorized: options.rejectUnauthorized,
      }),
    };

    const response = await axios.get(url, axiosConfig);

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Log the response object returned by Axios
    console.log("Axios response:", response);

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Log the JSDOM document object
    console.log("JSDOM document:", document);

    const hostingProvider = await detectHostingProvider(url);

    const analysis = {
      html_structure: analyzeHtmlStructure(document),
      css_frameworks: detectCssFrameworks(response.data, document),
      javascript_libraries: detectJavascriptLibraries(response.data, document),
      server_technologies: await detectServerTechnologies(url, response.headers),
      hosting_provider: hostingProvider,
      cdn_provider: detectCdnProvider(response.headers),
      cms: detectCMS(response.data, document),
      ecommerce_platform: detectEcommercePlatform(response.data, document),
      seo_analysis: await analyzeSEO(document),
      security_analysis: analyzeSecurity(response.headers),
      performance_analysis: analyzePerformance(response.headers, responseTime),
      accessibility_analysis: await analyzeAccessibility(document),
      architecture: detectArchitecture(response.data, document),
      marketing_technologies: detectMarketingTechnologies(
        response.data,
        document
      ),
      social_links: detectSocialLinks(document),
      robots_txt: await fetchRobotsTxt(new URL(url).origin),
      sitemap_xml: await fetchSitemapXml(new URL(url).origin),
    };

    // Log the results of each analysis function
    console.log("HTML structure:", analysis.html_structure);
    console.log("CSS frameworks:", analysis.css_frameworks);
    console.log("JavaScript libraries:", analysis.javascript_libraries);
    console.log("Server technologies:", analysis.server_technologies);
    console.log("Hosting provider:", analysis.hosting_provider);
    console.log("CDN provider:", analysis.cdn_provider);
    console.log("CMS:", analysis.cms);
    console.log("E-commerce platform:", analysis.ecommerce_platform);
    console.log("SEO analysis:", analysis.seo_analysis);
    console.log("Security analysis:", analysis.security_analysis);
    console.log("Performance analysis:", analysis.performance_analysis);
    console.log("Accessibility analysis:", analysis.accessibility_analysis);
    console.log("Architecture:", analysis.architecture);
    console.log("Marketing technologies:", analysis.marketing_technologies);
    console.log("Social links:", analysis.social_links);
    console.log("robots.txt:", analysis.robots_txt);
    console.log("sitemap.xml:", analysis.sitemap_xml);
    const architectureDiagram = generateArchitectureDiagram(analysis);

    return {
      analysis_results: analysis,
      architecture_diagram: architectureDiagram,
    };
  } catch (error) {
    console.error("Error analyzing website:", error);
    console.log("Analyzing URL:", url, "with options:", options);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          `HTTP error ${error.response.status}: ${error.response.statusText}`
        );
      } else if (error.request) {
        throw new Error(
          "No response received from the server. The website might be down or blocking our requests."
        );
      }
    }

    // Detailed error logging
    if (error instanceof Error) {
      const errorMessage = error.message;
      const errorStack = error.stack;
      console.error("Error details:", {
        message: errorMessage,
        stack: errorStack,
      });
      throw new Error(
        `An unexpected error occurred while analyzing the website: ${errorMessage}`
      );
    }

    throw new Error(
      "An unexpected error occurred while analyzing the website."
    );
  }
}

// Security Analysis
function analyzeSecurity(
  headers: AxiosResponseHeaders | RawAxiosResponseHeaders
): Record<string, any> {
  return {
    https: headers["strict-transport-security"] ? true : false,
    sslTLS: headers["content-security-policy"] ? true : false,
    securityHeaders: Object.keys(headers).filter((header) =>
      header.startsWith("security-")
    ),
    xssProtection: headers["x-xss-protection"],
    frameOptions: headers["x-frame-options"],
    referrerPolicy: headers["referrer-policy"],
  };
}

// Performance Analysis
function analyzePerformance(
  headers: AxiosResponseHeaders | RawAxiosResponseHeaders,
  responseTime: number
): Record<string, any> {
  return {
    cacheControl: headers["cache-control"],
    expires: headers["expires"],
    contentEncoding: headers["content-encoding"],
    transferEncoding: headers["transfer-encoding"],
    responseTime: `${responseTime.toFixed(2)} ms`,
    firstContentfulPaint: calculateFirstContentfulPaint(responseTime),
    largestContentfulPaint: calculateLargestContentfulPaint(responseTime),
    totalBlockingTime: calculateTotalBlockingTime(responseTime),
    cumulativeLayoutShift: calculateCumulativeLayoutShift(responseTime),
  };
}

// SEO Analysis
async function analyzeSEO(document: Document): Promise<Record<string, any>> {
  return {
    metaTitle: document.title,
    metaDescription: document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content"),
    metaKeywords: document
      .querySelector('meta[name="keywords"]')
      ?.getAttribute("content"),
      headerTags: Array.from(
        document.querySelectorAll("h1, h2, h3, h4, h5, h6")
      ).map((header) => header.textContent),
      imageAltTags: Array.from(document.querySelectorAll("img")).map(
        (image) => image.alt
      ),
      internalLinks: Array.from(document.querySelectorAll("a"))
      .filter((link) => link.href && link.href.startsWith("/"))
      .map((link) => link.href),
      externalLinks: Array.from(document.querySelectorAll("a"))
      .filter((link) => link.href && link.href.startsWith("http"))
      .map((link) => link.href),
      robots_txt: await fetchRobotsTxt(new URL(URL).origin),
      sitemap_xml: await fetchSitemapXml(new URL(URL).origin),
    };
  }
// Updated fetchRobotsTxt function
async function fetchRobotsTxt(baseURL: string): Promise<string> {
  const robotsUrl = `${baseURL}/robots.txt`;
  try {
    const response = await axios.get(robotsUrl, {
      timeout: 5000,
      validateStatus: (status) => status < 400,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching robots.txt from ${robotsUrl}:`, error);
    return "Unable to fetch robots.txt";
  }
}

// Updated fetchSitemapXml function
async function fetchSitemapXml(baseURL: string): Promise<string> {
  const sitemapUrls = [
    `${baseURL}/sitemap.xml`,
    `${baseURL}/sitemap_index.xml`,
    `${baseURL}/sitemap1.xml`,
    `${baseURL}/sitemap-index.xml`,
  ];

  for (const url of sitemapUrls) {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: (status) => status < 400,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching sitemap from ${url}:`, error);
    }
  }

  return "Unable to fetch sitemap.xml";
}
  
  // Accessibility Analysis
  async function analyzeAccessibility(document: Document): Promise<Record<string, any>> {
  return {
    semanticHTML:
      document.querySelectorAll(
        "header, nav, main, section, article, aside, footer"
      ).length > 0,
    altTextForImages: Array.from(document.querySelectorAll("img")).every(
      (image) => image.alt
    ),
    descriptiveLinkText: Array.from(document.querySelectorAll("a")).every(
      (link) => link.textContent?.trim() !== ""
    ),
    languageAttribute: document.documentElement.lang,
    contrastRatio: await calculateContrastRatio(document),
    audioTranscripts: detectAudioTranscripts(document),
    videoTranscripts: detectVideoTranscripts(document),
  };
}

// HTML Structure Analysis
function analyzeHtmlStructure(doc: Document): Record<string, number> {
  const structure: Record<string, number> = {};
  const elements = doc.getElementsByTagName("*");
  for (const element of elements) {
    const tagName = element.tagName.toLowerCase();
    structure[tagName] = (structure[tagName] || 0) + 1;
  }
  return structure;
}

// CSS Framework Detection
function detectCssFrameworks(html: string, doc: Document): string[] {
  const frameworks: string[] = [];
  const cssFrameworks = [
    { name: "Bootstrap", keyword: "bootstrap" },
    { name: "Tailwind CSS", keyword: "tailwind" },
    { name: "Bulma", keyword: "bulma" },
    { name: "Foundation", keyword: "foundation" },
    { name: "Materialize", keyword: "materialize" },
    { name: "Semantic UI", keyword: "semantic-ui" },
    { name: "Ant Design", keyword: "ant-design" },
    { name: "Material UI", keyword: "material-ui" },
    { name: "Chakra UI", keyword: "chakra-ui" },
  ];

  cssFrameworks.forEach(({ name, keyword }) => {
    if (
      html.includes(keyword) ||
      doc.querySelector(`link[href*="${keyword}"]`)
    ) {
      frameworks.push(name);
    }
  });

  return frameworks;
}

// JavaScript Library Detection
function detectJavascriptLibraries(html: string, doc: Document): string[] {
  const libraries: string[] = [];
  const jsLibraries = [
    { name: "React", keyword: "react" },
    { name: "jQuery", keyword: "jquery" },
    { name: "Vue.js", keyword: "vue" },
    { name: "Angular", keyword: "angular" },
    { name: "Lodash", keyword: "lodash" },
    { name: "Moment.js", keyword: "moment" },
    { name: "Axios", keyword: "axios" },
    { name: "D3.js", keyword: "d3" },
    { name: "Redux", keyword: "redux" },
    { name: "Next.js", keyword: "next" },
    { name: "Gatsby", keyword: "gatsby" },
    { name: "Ember", keyword: "ember" },
    { name: "Svelte", keyword: "svelte" },
    { name: "Nuxt.js", keyword: "nuxt" },
    { name: "Apollo GraphQL", keyword: "apollo" },
    { name: "Three.js", keyword: "three" },
  ];

  jsLibraries.forEach(({ name, keyword }) => {
    if (
      html.includes(keyword) ||
      doc.querySelector(`script[src*="${keyword}"]`)
    ) {
      libraries.push(name);
    }
  });

  return libraries;
}

// Server Technology Detection
async function detectServerTechnologies(
  url: string,
  headers: AxiosResponseHeaders | RawAxiosResponseHeaders
): Promise<string[]> {
  const technologies: string[] = [];
  const server = headers["server"] as string | undefined;
  const poweredBy = headers["x-powered-by"] as string | undefined;
  const via = headers["via"] as string | undefined;
  const xAspNetVersion = headers["x-aspnet-version"] as string | undefined;
  const xRailsVersion = headers["x-rails-version"] as string | undefined;
  const contentType = headers["content-type"] as string | undefined;
  const cdnHeader = headers["cdn-provider"] as string | undefined;

  console.debug("Server header:", server);
  console.debug("x-powered-by header:", poweredBy);
  console.debug("via header:", via);
  console.debug("x-aspnet-version header:", xAspNetVersion);
  console.debug("x-rails-version header:", xRailsVersion);
  console.debug("Content-Type header:", contentType);
  console.debug("CDN provider header:", cdnHeader);

  if (server) {
    if (/apache/i.test(server)) technologies.push("Apache");
    if (/nginx/i.test(server)) technologies.push("Nginx");
    if (/microsoft-iis/i.test(server)) technologies.push("IIS");
    if (/litespeed/i.test(server)) technologies.push("LiteSpeed");
  }

  if (poweredBy) {
    if (/php/i.test(poweredBy)) technologies.push("PHP");
    if (/asp\.net/i.test(poweredBy)) technologies.push("ASP.NET");
    if (/express/i.test(poweredBy)) technologies.push("Express.js");
    if (/rails/i.test(poweredBy)) technologies.push("Ruby on Rails");
    if (/laravel/i.test(poweredBy)) technologies.push("Laravel");
    if (/django/i.test(poweredBy)) technologies.push("Django");
    if (/node\.js/i.test(poweredBy)) technologies.push("Node.js");
  }

  if (via) {
    if (/cloudflare/i.test(via)) technologies.push("Cloudflare");
  }

  if (xAspNetVersion) technologies.push("ASP.NET");
  if (xRailsVersion) technologies.push("Ruby on Rails");

  if (cdnHeader) {
    technologies.push(`CDN: ${cdnHeader}`);
  }

  if (contentType) {
    if (/application\/json/i.test(contentType)) technologies.push("API Server");
    if (/text\/html/i.test(contentType)) technologies.push("Web Server");
  }

  // Additional checks using the response body
  const response = await axios.get(url, {
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });
  const html = response.data as string;

  if (html.includes('wp-content')) technologies.push("WordPress");
  if (html.includes('Drupal')) technologies.push("Drupal");
  if (html.includes('Joomla')) technologies.push("Joomla");
  if (html.includes('Shopify')) technologies.push("Shopify");

  console.debug("Detected server technologies:", technologies);

  return technologies;
}

// Hosting Provider Detection
async function detectHostingProvider(url: string): Promise<string> {
  const apiKey =
    "wu4prqwwhtubn2999uxru4voyt903eflke963sow5mzso0x50j53uzl11w337q4gbxx6m9"; // Your API key
  const domain = new URL(url).hostname;

  console.debug("API Key:", apiKey);
  console.debug("Domain extracted from URL:", domain);

  try {
    // Call the Who Hosts This API
    const response = await axios.get(
      `https://www.who-hosts-this.com/API/Host`,
      {
        params: {
          key: apiKey,
          url: domain,
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    );

    console.debug("API Response:", response.data);

    const { result, results } = response.data;

    console.debug("Result object from API response:", result);
    console.debug("Results array from API response:", results);

    if (result.code === 200 && results && results.length > 0) {
      // Assuming we want to return the ISP name
      const ispName = results[0].isp_name;
      console.debug("ISP Name found:", ispName);
      return `Provider: ${ispName}`;
    } else {
      console.error(
        "No hosting provider found in API response:",
        response.data
      );
      return "unable to find provider";
    }
  } catch (error) {
    console.error("Error calling Who Hosts This API:", error);
    return "Host Finder Error"; // Fallback if API call fails
  }
}

// CDN Provider Detection
function detectCdnProvider(
  headers: AxiosResponseHeaders | RawAxiosResponseHeaders
): string {
  if (headers["x-cdn"] === "Cloudflare" || headers["cf-ray"])
    return "Cloudflare";
  if (headers["x-amz-cf-id"]) return "Amazon CloudFront";
  if (headers["x-fastly-request-id"]) return "Fastly";
  if (headers["x-akamai-transformed"]) return "Akamai";
  if (
    headers["x-cache-status"] &&
    (headers["x-cache-status"] as string).includes("HIT")
  )
    return "Varnish";
  if (headers["x-cdn-provider"]) return headers["x-cdn-provider"] as string;
  return "Unknown";
}

// CMS Detection
function detectCMS(html: string, doc: Document): string {
  if (
    html.includes("wp-content") ||
    doc.querySelector('meta[name="generator"][content*="WordPress"]')
  )
    return "WordPress";
  if (
    html.includes("Drupal") ||
    doc.querySelector('meta[name="generator"][content*="Drupal"]')
  )
    return "Drupal";
  if (
    html.includes("Joomla") ||
    doc.querySelector('meta[name="generator"][content*="Joomla"]')
  )
    return "Joomla";
  if (
    html.includes("ghost") ||
    doc.querySelector('meta[name="generator"][content*="Ghost"]')
  )
    return "Ghost";
  if (
    html.includes("contentful") ||
    doc.querySelector('meta[name="generator"][content*="Contentful"]')
  )
    return "Contentful";
  if (
    html.includes("hubspot") ||
    doc.querySelector('meta[name="generator"][content*="HubSpot"]')
  )
    return "HubSpot";
  return "Unknown";
}

// E-commerce Platform Detection
function detectEcommercePlatform(html: string, doc: Document): string {
  const ecommercePlatforms = [
    { name: "Shopify", keywords: ["shopify"], selector: 'link[href*="shopify"]' },
    { name: "Magento", keywords: ["magento"], selector: 'script[src*="magento"]' },
    { name: "WooCommerce", keywords: ["woocommerce"], selector: 'link[href*="woocommerce"]' },
    { name: "BigCommerce", keywords: ["bigcommerce"], selector: 'link[rel="stylesheet"][href*="bigcommerce.com"]' },
    { name: "PrestaShop", keywords: ["prestashop"], selector: 'meta[name="generator"][content*="PrestaShop"]' },
    { name: "Squarespace", keywords: ["squarespace"], selector: 'meta[name="generator"][content*="Squarespace"]' },
    { name: "Wix", keywords: ["wixstores"], selector: 'meta[name="generator"][content*="Wix.com"]' },
    { name: "Volusion", keywords: ["volusion"], selector: 'script[src*="volusion"]' },
    { name: "3dcart", keywords: ["3dcart"], selector: 'script[src*="3dcart"]' },
    { name: "OpenCart", keywords: ["opencart"], selector: 'meta[name="generator"][content*="OpenCart"]' },
    { name: "Zen Cart", keywords: ["zen-cart"], selector: 'meta[name="generator"][content*="Zen Cart"]' },
    { name: "Squarespace", keywords: ["squarespace"], selector: 'meta[name="generator"][content*="Squarespace"]' },
    { name: "Weebly", keywords: ["weebly"], selector: 'meta[name="generator"][content*="Weebly"]' },
    { name: "Big Cartel", keywords: ["bigcartel"], selector: 'meta[name="generator"][content*="Big Cartel"]' },
    { name: "Yahoo Small Business", keywords: ["yahoodotcom"], selector: 'meta[name="generator"][content*="Yahoo Small Business"]' },
    { name: "Ecwid", keywords: ["ecwid"], selector: 'script[src*="ecwid"]' },
    { name: "osCommerce", keywords: ["oscommerce"], selector: 'meta[name="generator"][content*="osCommerce"]' },
    { name: "Lightspeed", keywords: ["lightspeed"], selector: 'meta[name="generator"][content*="LightSpeed"]' },
    { name: "Shopware", keywords: ["shopware"], selector: 'meta[name="generator"][content*="Shopware"]' },
    { name: "Hybris", keywords: ["hybris"], selector: 'script[src*="hybris"]' },
    { name: "Demandware", keywords: ["demandware"], selector: 'script[src*="demandware"]' },
  ];

  for (const platform of ecommercePlatforms) {
    if (platform.keywords.some(keyword => html.includes(keyword)) || doc.querySelector(platform.selector)) {
      return platform.name;
    }
  }

  return "Unknown";
}


// Calculate First Contentful Paint
function calculateFirstContentfulPaint(responseTime: number): string {
  // Placeholder function for illustration. Ideally, this would use a library or API to calculate.
  return `${(responseTime * 0.3).toFixed(2)} ms`;
}

// Calculate Largest Contentful Paint
function calculateLargestContentfulPaint(responseTime: number): string {
  // Placeholder function for illustration. Ideally, this would use a library or API to calculate.
  return `${(responseTime * 0.6).toFixed(2)} ms`;
}

// Calculate Total Blocking Time
function calculateTotalBlockingTime(responseTime: number): string {
  // Placeholder function for illustration. Ideally, this would use a library or API to calculate.
  return `${(responseTime * 0.2).toFixed(2)} ms`;
}

// Calculate Cumulative Layout Shift
function calculateCumulativeLayoutShift(responseTime: number): string {
  // Placeholder function for illustration. Ideally, this would use a library or API to calculate.
  return `${(responseTime * 0.1).toFixed(2)}`;
}

// Calculate Contrast Ratio
async function calculateContrastRatio(_document: Document): Promise<number> {
  // Placeholder function for illustration. Ideally, this would use a library like axe-core.
  return 4.5;
}

// Detect Audio Transcripts
function detectAudioTranscripts(document: Document): boolean {
  const audioElements = document.querySelectorAll("audio");
  return Array.from(audioElements).every(
    (audio) => audio.nextElementSibling && audio.nextElementSibling.tagName.toLowerCase() === "p"
  );
}

// Detect Video Transcripts
function detectVideoTranscripts(document: Document): boolean {
  const videoElements = document.querySelectorAll("video");
  return Array.from(videoElements).every(
    (video) => video.nextElementSibling && video.nextElementSibling.tagName.toLowerCase() === "p"
  );
}

// Detect Website Architecture (SPA, MPA, SSG, SSR)
function detectArchitecture(html: string, doc: Document): string {
  // Check for Server-Side Rendering (SSR)
  if (
    doc.querySelector('script[src*="next"]') ||
    html.includes("__NEXT_DATA__")
  ) {
    return "SSR (Server-Side Rendering)";
  }

  // Check for Static Site Generation (SSG)
  if (
    doc.querySelector('script[src*="gatsby"]') ||
    doc.querySelector('meta[content="Gatsby"]')
  ) {
    return "SSG (Static Site Generation)";
  }
  if (
    doc.querySelector('script[src*="jekyll"]') ||
    doc.querySelector('meta[content="Jekyll"]')
  ) {
    return "SSG (Static Site Generation)";
  }
  if (
    doc.querySelector('script[src*="hugo"]') ||
    doc.querySelector('meta[content="Hugo"]')
  ) {
    return "SSG (Static Site Generation)";
  }

  // Check for Single Page Application (SPA)
  if (
    doc.querySelector('script[src*="single-spa"]') ||
    doc.querySelector('script[src*="react"]') ||
    html.includes("window.__INITIAL_STATE__")
  ) {
    return "SPA (Single Page Application)";
  }
  if (
    doc.querySelector('script[src*="angular"]') ||
    html.includes("ng-version")
  ) {
    return "SPA (Single Page Application)";
  }
  if (
    doc.querySelector('script[src*="vue"]') ||
    html.includes("window.__INITIAL_STATE__")
  ) {
    return "SPA (Single Page Application)";
  }

  // Default to Multi-Page Application (MPA)
  return "MPA (Multi-Page Application)";
}

// Marketing Technologies Detection
function detectMarketingTechnologies(html: string, doc: Document): string[] {
  const marketingTechs: string[] = [];
  const techs = [
    {
      name: "Google Analytics",
      keyword: "google-analytics",
      regex: /analytics\.js/,
    },
    { name: "Google Tag Manager", keyword: "gtm", regex: /gtm\.js/ },
    { name: "Facebook Pixel", keyword: "fbevents", regex: /fbevents\.js/ },
    { name: "Hotjar", keyword: "hotjar", regex: /static\.hotjar\.com/ },
    { name: "HubSpot", keyword: "hubspot", regex: /js\.hubspot\.com/ },
    { name: "Marketo", keyword: "marketo", regex: /marketo\.com/ },
    { name: "Salesforce", keyword: "salesforce", regex: /salesforce\.com/ },
    { name: "Mixpanel", keyword: "mixpanel", regex: /cdn\.mixpanel\.com/ },
    { name: "Crazy Egg", keyword: "crazyegg", regex: /crazyegg\.com/ },
    { name: "Intercom", keyword: "intercom", regex: /intercom\.io/ },
    {
      name: "Kissmetrics",
      keyword: "kissmetrics",
      regex: /i\.kissmetrics\.com/,
    },
    { name: "Heap Analytics", keyword: "heap-analytics", regex: /heap\.js/ },
    { name: "Segment", keyword: "segment", regex: /segment\.js/ },
    { name: "Optimizely", keyword: "optimizely", regex: /optimizely\.js/ },
  ];

  techs.forEach(({ name, keyword, regex }) => {
    if (
      html.includes(keyword) ||
      doc.querySelector(`script[src*="${keyword}"]`) ||
      regex.test(html)
    ) {
      marketingTechs.push(name);
    }
  });

  return marketingTechs;
}

// Social Links Detection
function detectSocialLinks(doc: Document): string[] {
  const socialLinks: string[] = [];
  const socialPlatforms = [
    "facebook.com",
    "twitter.com",
    "linkedin.com",
    "instagram.com",
    "youtube.com",
    "tiktok.com",
    "x.com",
    "pinterest.com",
    "reddit.com",
  ];

  socialPlatforms.forEach((platform) => {
    const links = Array.from(
      doc.querySelectorAll(`a[href*="${platform}"]`)
    ).map((link) => link.getAttribute("href")?.toString());
    socialLinks.push(...links.filter((link) => link !== undefined));
  });

  return socialLinks;
}

// Generate Architecture Diagram
function generateArchitectureDiagram(analysis: any): string {
  try {
    let diagram = "graph TD\n";
    diagram += "  A[Client] --> B[Website]\n";

    let nodeId = 1;
    const getNextId = () => {
      return `N${nodeId++}`;
    };

    const addNodes = (parentId: string, items: string[], label: string) => {
      if (items && items.length > 0) {
        const id = getNextId();
        diagram += `  ${parentId} --> ${id}[${label}]\n`;
        items.forEach((item) => {
          const itemId = getNextId();
          diagram += `  ${id} --> ${itemId}["${item.replace(/"/g, "'")}"]\n`;
        });
      }
    };

    addNodes("B", analysis.css_frameworks, "CSS Frameworks");
    addNodes("B", analysis.javascript_libraries, "JavaScript Libraries");
    addNodes("B", analysis.server_technologies, "Server Technologies");

    if (analysis.hosting_provider && analysis.hosting_provider !== "Unknown") {
      diagram += `  B --> ${getNextId()}["Hosting: ${analysis.hosting_provider.replace(
        /"/g,
        "'"
      )}"]\n`;
    }

    if (analysis.cdn_provider && analysis.cdn_provider !== "Unknown") {
      diagram += `  B --> ${getNextId()}["CDN: ${(
        analysis.cdn_provider as string
      ).replace(/"/g, "'")}"]\n`;
    }

    if (analysis.cms && analysis.cms !== "Unknown") {
      diagram += `  B --> ${getNextId()}["CMS: ${(
        analysis.cms as string
      ).replace(/"/g, "'")}"]\n`;
    }

    if (
      analysis.ecommerce_platform &&
      analysis.ecommerce_platform !== "Unknown"
    ) {
      diagram += `  B --> ${getNextId()}["E-commerce: ${analysis.ecommerce_platform.replace(
        /"/g,
        "'"
      )}"]\n`;
    }

    if (analysis.architecture && analysis.architecture !== "Unknown") {
      diagram += `  B --> ${getNextId()}["Architecture: ${analysis.architecture.replace(
        /"/g,
        "'"
      )}"]\n`;
    }

    if (
      analysis.marketing_technologies &&
      analysis.marketing_technologies.length > 0
    ) {
      addNodes("B", analysis.marketing_technologies, "Marketing Technologies");
    }

    // Add clickable social links node
    if (analysis.social_links && analysis.social_links.length > 0) {
      const socialLinksNode = getNextId();
      diagram += `  B --> ${socialLinksNode}[Social Links]\n`;
      analysis.social_links.forEach((link: any) => {
        const socialLinkId = getNextId();
        diagram += `  ${socialLinksNode} --> ${socialLinkId}["<a href='${link}' target='_blank'>${link}</a>"]\n`;
      });
    }

    diagram += `  B --> ${getNextId()}[SEO Analysis]\n`;
    diagram += `  B --> ${getNextId()}[Security Analysis]\n`;
    diagram += `  B --> ${getNextId()}[Performance Analysis]\n`;
    diagram += `  B --> ${getNextId()}[Accessibility Analysis]\n`;

    console.log("Diagram generated:", diagram);
    return diagram;
  } catch (error) {
    console.error("Error generating architecture diagram:", error);
    return "";
  }
}
