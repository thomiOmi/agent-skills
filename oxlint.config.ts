import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["import", "promise"],
  options: {
    typeAware: true,
    typeCheck: true,
    maxWarnings: 10,
  },
});
