import { updatePageSEO } from './seo';

interface RouteConfig {
  path: string;
  component: string;
  title: string;
  exact?: boolean;
}

export const routes: RouteConfig[] = [
  { path: '/', component: 'home', title: 'Note Calc — Calculator & Notes', exact: true },
  { path: '/features', component: 'features', title: 'Features — Note Calc' },
  { path: '/use-cases', component: 'use-cases', title: 'Use Cases — Note Calc' },
  { path: '/about', component: 'about', title: 'About — Note Calc' },
  { path: '/privacy-policy', component: 'privacy-policy', title: 'Privacy Policy — Note Calc' },
  { path: '/terms-of-service', component: 'terms-of-service', title: 'Terms of Service — Note Calc' }
];

export class Router {
  private onRouteChange: (route: string) => void;
  private onTitleChange?: (title: string) => void;

  constructor(
    onRouteChange: (route: string) => void,
    onTitleChange?: (title: string) => void
  ) {
    this.onRouteChange = onRouteChange;
    this.onTitleChange = onTitleChange;
    this.initialize();
  }

  private initialize(): void {
    // Handle initial page load
    this.handleInitialRoute();
    
    // Listen for browser back/forward button
    window.addEventListener('popstate', () => {
      this.handleInitialRoute();
    });
  }

  private handleInitialRoute(): void {
    const currentPath = window.location.pathname;
    const route = this.pathToRoute(currentPath);
    
    // Update SEO data for the current page
    updatePageSEO(route);
    
    this.onRouteChange(route);
    
    // Update page title
    const routeConfig = routes.find(r => r.component === route);
    if (routeConfig && this.onTitleChange) {
      this.onTitleChange(routeConfig.title);
    }
  }

  private pathToRoute(path: string): string {
    const route = routes.find(r => {
      if (r.exact) {
        return r.path === path;
      }
      return path.startsWith(r.path);
    });
    
    return route ? route.component : 'home';
  }

  public navigate(route: string): void {
    const routeConfig = routes.find(r => r.component === route);
    if (!routeConfig) {
      console.warn(`Route not found: ${route}`);
      return;
    }

    // Update URL without page reload
    const currentPath = window.location.pathname;
    if (currentPath !== routeConfig.path) {
      window.history.pushState(null, '', routeConfig.path);
    }

    // Update SEO data for the new page
    updatePageSEO(route);

    // Update page title
    if (this.onTitleChange) {
      this.onTitleChange(routeConfig.title);
    }

    // Trigger route change
    this.onRouteChange(route);
  }
}

export default Router;
