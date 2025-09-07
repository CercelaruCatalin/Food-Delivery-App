import autoCert from "anchor-pki/auto-cert/integrations/next";

// If using .ts instead of .mjs, you can use the following comment to suppress the error
// @ts-expect-error - No type definitions available for anchor-pki
const withAutoCert = autoCert({
  enabledEnv: "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default withAutoCert(nextConfig);
