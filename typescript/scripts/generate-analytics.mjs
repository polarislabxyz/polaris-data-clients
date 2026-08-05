import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const source = process.env.POLARIS_ANALYTICS_OPENAPI;
if (!source) {
  throw new Error("POLARIS_ANALYTICS_OPENAPI must point to the canonical analytics OpenAPI file");
}

const output = resolve("src/generated/analytics-v2.ts");
const ast = await openapiTS(pathToFileURL(resolve(source)));
const generated = `${astToString(ast)}\n`;

if (process.argv.includes("--check")) {
  const current = await readFile(output, "utf8").catch(() => "");
  if (current !== generated) {
    throw new Error("generated analytics types are out of sync with the canonical OpenAPI");
  }
} else {
  await mkdir(resolve("src/generated"), { recursive: true });
  await writeFile(output, generated);
}
