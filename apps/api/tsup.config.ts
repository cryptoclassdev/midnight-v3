import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  // Bundle workspace packages so no raw .ts imports at runtime
  noExternal: ["@mintfeed/db", "@mintfeed/shared"],
  // Prisma uses dynamic require("fs") — must stay external
  external: ["@prisma/client", ".prisma/client"],
});
