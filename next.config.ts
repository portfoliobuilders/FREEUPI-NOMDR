import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/setup": ["./supabase/migrations/**"],
  },
};

export default nextConfig;
