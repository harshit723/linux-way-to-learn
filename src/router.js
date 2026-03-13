import { Store } from './store.js';

export class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentRoute = null;
    
    // Listen to hash changes
    window.addEventListener('hashchange', this.handleRouteChange.bind(this));
  }

  init() {
    this.handleRouteChange();
  }

  handleRouteChange() {
    const hash = window.location.hash.slice(1) || '/';
    console.log('[Router] Navigating to:', hash);

    let match = null;
    let params = {};

    for (const pattern in this.routes) {
      const keys = [];
      const regexPattern = pattern.replace(/:([^\/]+)/g, (_, key) => {
        keys.push(key);
        return '([^\\/]+)';
      });
      
      const regex = new RegExp(`^${regexPattern}$`);
      const matchResult = hash.match(regex);

      if (matchResult) {
        match = this.routes[pattern];
        
        // Extract params
        keys.forEach((key, index) => {
          params[key] = matchResult[index + 1];
        });
        
        break;
      }
    }

    if (match) {
      this.currentRoute = { path: hash, handler: match, params };
      this.render();
    } else {
      console.warn('Route not found:', hash);
      // Fallback to home
      window.location.hash = '/';
    }
  }

  render() {
    const appContainer = document.getElementById('app');
    
    // Check if the handler actually exists
    if (typeof this.currentRoute.handler === 'function') {
      // Clear contents
      appContainer.innerHTML = '';
      
      try {
        // Execute the handler, passing any URL params
        const component = this.currentRoute.handler(this.currentRoute.params);
        if (component instanceof HTMLElement) {
          appContainer.appendChild(component);
        } else if (typeof component === 'string') {
          appContainer.innerHTML = component;
        }
      } catch (err) {
        console.error('Error rendering route:', err);
        appContainer.innerHTML = `<div class="container main-content"><h2>Error loading page</h2><p>${err.message}</p></div>`;
      }
    }
  }
  
  navigate(path) {
    window.location.hash = path;
  }
}
