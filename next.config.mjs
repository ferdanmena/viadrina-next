import nextMDX from '@next/mdx'

const withMDX = nextMDX({
  extension: /\.mdx?$/,
})

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imgcdn.bokun.tools',
      },
      {
        protocol: 'https',
        hostname: 'bokun.s3.amazonaws.com',
      },
    ],
  },
};


export default withMDX(nextConfig)