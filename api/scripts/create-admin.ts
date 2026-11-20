import { adminApi } from "../features/admin/index.js";

function die(message: string): never {
  console.error(message);
  process.exit(1);
}

const [username, password] = process.argv.slice(2);
if (!username || !password)
  die("Usage: npm run api:admin -- <username> <password>");

try {
  await adminApi.createOrUpdateAdmin(username, password);
  console.info(`Admin "${username.toLowerCase()}" saved.`);
} catch (error) {
  die(error instanceof Error ? error.message : "Could not save admin.");
}
