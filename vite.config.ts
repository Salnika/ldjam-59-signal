import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

const define: Record<string, string> = {};

if (process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL) {
  define["import.meta.env.VITE_SUPABASE_URL"] = JSON.stringify(process.env.SUPABASE_URL);
}

if (process.env.SUPABASE_ANON_KEY && !process.env.VITE_SUPABASE_ANON_KEY) {
  define["import.meta.env.VITE_SUPABASE_ANON_KEY"] = JSON.stringify(process.env.SUPABASE_ANON_KEY);
}

if (process.env.SUPABASE_PUBLISHABLE_KEY && !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  define["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"] = JSON.stringify(
    process.env.SUPABASE_PUBLISHABLE_KEY,
  );
}

export default defineConfig({
  define,
  plugins: [react(), vanillaExtractPlugin()],
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
});
