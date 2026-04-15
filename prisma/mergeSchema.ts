import fs from "fs";
import path from "path";

const modelsDir = "./prisma/models";
const outputFile = "./prisma/schema.prisma";

const baseSchema = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

const files = fs.readdirSync(modelsDir);

const models = files
  .map((file: string) => fs.readFileSync(path.join(modelsDir, file), "utf-8"))
  .join("\n");

fs.writeFileSync(outputFile, baseSchema + models);