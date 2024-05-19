import { defineConfig } from 'dumi';
import { version } from './package.json';

export default defineConfig({
  html2sketch: {},
  favicons: [
    '/mosaic2.png',
  ],
  autoAlias: false,
  outputPath: 'docs-dist',
  define: {
    'process.env.DUMI_VERSION': version,
  },
  themeConfig: {
    hd: { rules: [] },
    rtl: true,
    name: 'proxy-mosaic',
    logo: '/mosaic2.png',
    footer: `Open-source MIT Licensed | Copyright © 2019-present
<br />
Powered by self`,
    prefersColor: { default: 'auto' },
    socialLinks: {
      github: 'https://github.com/shanchuan1/proxy-mosaic',
    },
    lastUpdated: true,
    nprogress: true,
  },
  ...(process.env.NODE_ENV === 'development' ? {} : { ssr: {} }),
  analytics: {
    ga_v2: 'G-GX2S89BMXB',
  },
  sitemap: { hostname: 'https://d.umijs.org' },
});
