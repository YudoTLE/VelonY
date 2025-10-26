import type { IConfig } from 'next-sitemap';

const config: IConfig = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://velony.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
};

export default config;
