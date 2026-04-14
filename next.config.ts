import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old single-page URLs → new route-per-status
      { source: '/', destination: '/micro', permanent: true, has: [{ type: 'query', key: 'sel', value: 'micro' }] },
      { source: '/', destination: '/ei', permanent: true, has: [{ type: 'query', key: 'sel', value: 'ei' }] },
      { source: '/', destination: '/eurl', permanent: true, has: [{ type: 'query', key: 'sel', value: 'eurl' }] },
      { source: '/', destination: '/sasu', permanent: true, has: [{ type: 'query', key: 'sel', value: 'sasu' }] },
      { source: '/', destination: '/holding', permanent: true, has: [{ type: 'query', key: 'sel', value: 'holding' }] },
    ];
  },
};

export default nextConfig;
