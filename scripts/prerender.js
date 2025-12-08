import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the main index.html template
const distDir = path.join(__dirname, '../dist');
const templatePath = path.join(distDir, 'index.html');
const template = fs.readFileSync(templatePath, 'utf-8');

// SEO data for each page
const seoData = {
  'privacy-policy': {
    title: "Privacy Policy — Note Calc Data Protection",
    description: "Note Calc privacy policy explaining how we protect your data. All calculations and notes stored locally on your device for maximum privacy.",
    keywords: "privacy policy, data protection, calculator privacy, note taking privacy, local storage"
  },
  'terms-of-service': {
    title: "Terms of Service — Note Calc Terms & Conditions", 
    description: "Terms of service for Note Calc calculator and note-taking app. Free to use with clear guidelines for acceptable usage.",
    keywords: "terms of service, terms and conditions, calculator app terms, usage policy"
  },
  'about': {
    title: "About — Note Calc Mission & Development",
    description: "Learn about Note Calc's mission to revolutionize productivity with multi-calculator support and seamless note integration. Built for modern workflows.",
    keywords: "about note calc, calculator app development, productivity mission, note taking innovation"
  },
  'features': {
    title: "Features — Note Calc App",
    description: "Discover Note Calc's powerful features: multiple calculator types, rich-text notes, offline support, keyboard shortcuts, and export options.",
    keywords: "calculator features, note taking features, offline calculator, multi calculator, productivity tools"
  },
  'use-cases': {
    title: "Use Cases — Note Calc for Students, Engineers & Professionals",
    description: "See how Note Calc helps students solve math problems, engineers with calculations, accountants with financial data, and professionals boost productivity.",
    keywords: "calculator for students, engineering calculator, accounting calculator, productivity use cases, math problem solving"
  }
};

// Generate HTML for each page
Object.entries(seoData).forEach(([route, seo]) => {
  let pageHtml = template
    .replace(/<title>.*?<\/title>/, `<title>${seo.title}</title>`)
    .replace(/(<meta name="description"\s+content=")[^"]*(")/g, `$1${seo.description}$2`)
    .replace(/(<meta name="keywords"\s+content=")[^"]*(")/g, `$1${seo.keywords}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/g, `$1${seo.title}$2`)
    .replace(/(<meta property="og:description"\s+content=")[^"]*(")/g, `$1${seo.description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/g, `$1https://notecalc.app/${route}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/g, `$1${seo.title}$2`)
    .replace(/(<meta name="twitter:description"\s+content=")[^"]*(")/g, `$1${seo.description}$2`);

  // Add canonical URL if it doesn't exist
  if (!pageHtml.includes('rel="canonical"')) {
    pageHtml = pageHtml.replace('</head>', `  <link rel="canonical" href="https://notecalc.app/${route}" />\n</head>`);
  } else {
    pageHtml = pageHtml.replace(/(<link rel="canonical" href=")[^"]*(")/g, `$1https://notecalc.app/${route}$2`);
  }
  
  // Create directory and write file
  const pageDir = path.join(distDir, route);
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml);
  console.log(`Generated: ${route}/index.html`);
});

console.log('Pre-rendering complete!');
