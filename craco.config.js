const path = require("path");
module.exports = {
  webpack: {
    alias: {
      "@shared": path.resolve(__dirname, "src/shared"),
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@types": path.resolve(__dirname, "src/types.ts"),
      "@firestore": path.resolve(__dirname, "src/firestore.ts"),
    },
  },
};
