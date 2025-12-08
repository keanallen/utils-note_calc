// SEO utility functions for dynamic meta tags and structured data

export interface PageSEO {
  title: string;
  description: string;
  canonical: string;
  keywords?: string;
  ogType?: string;
  structuredData?: any;
}

export const seoData: Record<string, PageSEO> = {
  home: {
    title: "Note Calc — All-In-One Calculator and Note-Taking App",
    description: "Open multiple calculators, take rich-text notes, and work offline. A fast, installable productivity PWA for students, professionals, and multitaskers.",
    canonical: "/",
    keywords: "calculator with notes, multi calculator app, note taking calculator, pwa calculator, offline calculator, productivity app",
    ogType: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Note Calc",
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Any",
      "description": "All-in-one calculator and note-taking app with multiple calculator windows and rich-text notes editor",
      "url": "https://notecalc.app",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "author": {
        "@type": "Person",
        "name": "Note Calc Team"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "150"
      }
    }
  },
  features: {
    title: "Features — Note Calc App",
    description: "Discover Note Calc's powerful features: multiple calculator types, rich-text notes, offline support, keyboard shortcuts, and export options.",
    canonical: "/features",
    keywords: "calculator features, note taking features, offline calculator, multi calculator, productivity tools",
    ogType: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Note Calc Features - Multi-Calculator & Notes App",
      "description": "Comprehensive guide to Note Calc's features including multiple calculator types, rich-text editor, offline support, and productivity tools.",
      "url": "https://notecalc.app/features",
      "author": {
        "@type": "Organization",
        "name": "Note Calc"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Note Calc"
      },
      "dateModified": new Date().toISOString(),
      "mainEntityOfPage": "https://notecalc.app/features"
    }
  },
  "use-cases": {
    title: "Use Cases — Note Calc for Students, Engineers & Professionals",
    description: "See how Note Calc helps students solve math problems, engineers with calculations, accountants with financial data, and professionals boost productivity.",
    canonical: "/use-cases",
    keywords: "calculator for students, engineering calculator, accounting calculator, productivity use cases, math problem solving",
    ogType: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Note Calc Use Cases - Perfect for Students, Engineers & Professionals",
      "description": "Real-world applications of Note Calc for education, engineering, accounting, and professional productivity.",
      "url": "https://notecalc.app/use-cases",
      "author": {
        "@type": "Organization",
        "name": "Note Calc"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Note Calc"
      },
      "dateModified": new Date().toISOString(),
      "mainEntityOfPage": "https://notecalc.app/use-cases"
    }
  },
  about: {
    title: "About — Note Calc Mission & Development",
    description: "Learn about Note Calc's mission to revolutionize productivity with multi-calculator support and seamless note integration. Built for modern workflows.",
    canonical: "/about",
    keywords: "about note calc, calculator app development, productivity mission, note taking innovation",
    ogType: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About Note Calc",
      "description": "Learn about Note Calc's mission, development, and commitment to productivity innovation.",
      "url": "https://notecalc.app/about",
      "mainEntity": {
        "@type": "Organization",
        "name": "Note Calc",
        "description": "Developer of the Note Calc productivity application",
        "url": "https://notecalc.app"
      }
    }
  },
  "privacy-policy": {
    title: "Privacy Policy — Note Calc Data Protection",
    description: "Note Calc privacy policy explaining how we protect your data. All calculations and notes stored locally on your device for maximum privacy.",
    canonical: "/privacy-policy",
    keywords: "privacy policy, data protection, calculator privacy, note taking privacy, local storage",
    ogType: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Privacy Policy - Note Calc",
      "description": "Comprehensive privacy policy for Note Calc calculator and note-taking app",
      "url": "https://notecalc.app/privacy-policy"
    }
  },
  "terms-of-service": {
    title: "Terms of Service — Note Calc Terms & Conditions",
    description: "Terms of service for Note Calc calculator and note-taking app. Free to use with clear guidelines for acceptable usage.",
    canonical: "/terms-of-service",
    keywords: "terms of service, terms and conditions, calculator app terms, usage policy",
    ogType: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Terms of Service - Note Calc",
      "description": "Legal terms and conditions for using Note Calc application",
      "url": "https://notecalc.app/terms-of-service"
    }
  }
};

export const updatePageSEO = (pageId: string) => {
  const seo = seoData[pageId] || seoData.home;
  
  // Update page title
  document.title = seo.title;
  
  // Update meta description
  updateMetaTag('description', seo.description);
  
  // Update keywords if provided
  if (seo.keywords) {
    updateMetaTag('keywords', seo.keywords);
  }
  
  // Update Open Graph tags
  updateMetaTag('og:title', seo.title, 'property');
  updateMetaTag('og:description', seo.description, 'property');
  updateMetaTag('og:type', seo.ogType || 'website', 'property');
  updateMetaTag('og:url', `https://notecalc.app${seo.canonical}`, 'property');
  
  // Update Twitter tags
  updateMetaTag('twitter:title', seo.title);
  updateMetaTag('twitter:description', seo.description);
  
  // Update canonical URL
  updateCanonicalUrl(seo.canonical);
  
  // Update structured data
  if (seo.structuredData) {
    updateStructuredData(seo.structuredData);
  }
};

const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.content = content;
};

const updateCanonicalUrl = (path: string) => {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  
  canonical.href = `https://notecalc.app${path}`;
};

const updateStructuredData = (data: any) => {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }
  
  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

// Breadcrumb utility
export const generateBreadcrumbs = (currentPage: string) => {
  const breadcrumbs = [
    { name: 'Home', href: '/', current: false }
  ];
  
  if (currentPage !== 'home') {
    const pageNames: Record<string, string> = {
      features: 'Features',
      'use-cases': 'Use Cases',
      about: 'About',
      'privacy-policy': 'Privacy Policy',
      'terms-of-service': 'Terms of Service'
    };
    
    breadcrumbs.push({
      name: pageNames[currentPage] || 'Page',
      href: `/${currentPage}`,
      current: true
    });
  } else {
    breadcrumbs[0].current = true;
  }
  
  return breadcrumbs;
};
