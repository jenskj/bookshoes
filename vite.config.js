const path = require("path");
const fs = require("fs");
const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");

const base = "/bookshoes/";

module.exports = defineConfig({
  base,
  plugins: [
    react(),
    // Serve public files under base path in dev (so /bookshoes/manifest.json etc. work)
    // Must run before Vite's SPA fallback so manifest.json isn't served as index.html
    {
      name: "serve-public-under-base",
      configureServer(server) {
        return () => {
          const basePath = base.replace(/\/$/, "");
          const prefix = "/" + basePath + "/";
          // Redirect root to base URL first (before Vite's "did you mean?" page)
          const redirectMiddleware = (req, res, next) => {
            const pathname = (req.url?.split("?")[0] ?? "/").replace(/\/$/, "") || "/";
            const rest = req.url?.includes("?") ? "?" + req.url.split("?").slice(1).join("?") : (req.url?.includes("#") ? (req.url.match(/#.*/)?.[0] ?? "") : "");
            if (pathname === "/" || pathname === "/" + basePath) {
              res.statusCode = 302;
              res.setHeader("Location", base + (rest || ""));
              return res.end();
            }
            next();
          };
          server.middlewares.stack.unshift({ route: "", handle: redirectMiddleware });
          const handler = (req, res, next) => {
            if (req.url.startsWith(prefix) && req.method === "GET") {
              const name = req.url.slice(prefix.length);
              const file = path.join(__dirname, "public", name);
              if (fs.existsSync(file) && fs.statSync(file).isFile()) {
                const mime = name.endsWith(".json")
                  ? "application/json"
                  : name.endsWith(".ico")
                    ? "image/x-icon"
                    : /\.(jpe?g|png|gif|webp)$/i.test(name)
                      ? "image/" +
                        (name
                          .match(/\.(jpe?g|png|gif|webp)$/i)?.[1]
                          .replace("jpg", "jpeg") ?? "jpeg")
                      : "application/octet-stream";
                res.setHeader("Content-Type", mime);
                return res.end(fs.readFileSync(file));
              }
            }
            next();
          };
          server.middlewares.stack.unshift({ route: "", handle: handler });
        };
      },
    },
  ],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "src/shared"),
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@types": path.resolve(__dirname, "src/types.ts"),
      "@lib/supabase": path.resolve(__dirname, "src/supabase.ts"),
      "@lib": path.resolve(__dirname, "src/lib"),
    },
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-mui-core": [
            "@mui/material",
            "@emotion/react",
            "@emotion/styled",
            "@emotion/is-prop-valid",
          ],
          "vendor-mui-icons": ["@mui/icons-material"],
          "vendor-mui-pickers": ["@mui/x-date-pickers"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-motion": ["framer-motion", "swiper"],
          "vendor-date": ["date-fns"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
