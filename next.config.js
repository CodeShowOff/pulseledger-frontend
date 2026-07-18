const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});

const withPWA = require('@ducanh2912/next-pwa').default({
	dest: 'public',
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === 'development',
	buildExcludes: [/middleware-manifest\.json$/],
	runtimeCaching: [
		{
			urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
			handler: 'CacheFirst',
			options: {
				cacheName: 'cloudinary-images',
				expiration: {
					maxEntries: 200,
					maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
				},
			},
		},
		{
			urlPattern: /^\/api\/.*/i,
			handler: 'NetworkFirst',
			options: {
				cacheName: 'api-cache',
				networkTimeoutSeconds: 10,
				expiration: {
					maxEntries: 50,
					maxAgeSeconds: 5 * 60, // 5 minutes
				},
			},
		},
		{
			urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
			handler: 'CacheFirst',
			options: {
				cacheName: 'image-cache',
				expiration: {
					maxEntries: 100,
					maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
				},
			},
		},
	],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	turbopack: {}, // Silence Turbopack warning
	experimental: {
		// Keep defaults; no experimental flags needed right now
	},
	images: {
		// Allow Cloudinary hosted images (QR codes, avatars, etc.)
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				port: "",
				pathname: "**",
			},
			{
				protocol: "https",
				hostname: "**.mm.bing.net",
				port: "",
				pathname: "**",
			},
			{
				protocol: "https",
				hostname: "picsum.photos",
				port: "",
				pathname: "**",
			},
		],
	},
	async rewrites() {
		// Proxy API to backend so cookies are same-site in dev
		const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
		return [
			{
				source: "/api/:path*",
				destination: `${backend}/api/:path*`,
			},
		];
	},
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));
