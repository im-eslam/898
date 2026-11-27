import { put } from "@vercel/blob";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) throw new Error("Missing BLOB_READ_WRITE_TOKEN");

const folders = ["popup", "products-full", "products-thumb"];
const tasks = [];

for (const folder of folders) {
  const dir = join(process.cwd(), "public", "menu", folder);
  const files = await readdir(dir);

  for (const file of files) {
    if (!file.endsWith(".webp")) continue;
    const targetName =
      folder === "products-thumb"
        ? file.replace(/@400w(\.[^.]+)$/, "$1")
        : file;

    tasks.push({
      localPath: join(dir, file),
      blobPath: `menu/${folder}/${targetName}`,
    });
  }
}

console.log(`Uploading ${tasks.length} images...`);

const CONCURRENCY = 5;
for (let i = 0; i < tasks.length; i += CONCURRENCY) {
  const batch = tasks.slice(i, i + CONCURRENCY);
  await Promise.all(
    batch.map(async ({ localPath, blobPath }) => {
      const buffer = await readFile(localPath);
      await put(blobPath, buffer, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "image/webp",
        token,
      });
      console.log(`OK: ${blobPath}`);
    })
  );
}

console.log("Migration complete.");
