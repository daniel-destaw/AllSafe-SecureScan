import {createRoot} from 'react-dom/client';
import {createInertiaApp} from '@inertiajs/react';
import Layout from '@/components/Layout.jsx';
import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  axios.defaults.headers.common['X-CSRFToken'] = csrfToken;

  const appName = document.getElementsByTagName('title')[0]?.innerText || 'Django';

  createInertiaApp({
    title: (title) => `${title} | ${appName}`,
    progress: {
      delay: 250,
      color: 'green',
      includeCSS: true,
      showSpinner: true,
    },
    resolve: (name) => {
      const pages = import.meta.glob('./pages/**/*.jsx', { eager: true });
      let page = pages[`./pages/${name}.jsx`];
      // Only set default layout if the page doesn't explicitly opt out
      if (!page.default.layout && !page.default.isLoginPage) {
        page.default.layout = Layout;
      }
      return page;
    },
    setup({ el, App, props }) {
      createRoot(el).render(<App {...props} />);
    }
  }).then(() => {});
});