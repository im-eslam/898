import { adminService } from "../features/admin/service.js";

function die(message: string): never {
  console.error(message);
  process.exit(1);
}

const [username, password] = process.argv.slice(2);

if (!username || !password)
  die("Usage: npm run api:admin -- <username> <password>");

try {
  await adminService.createOrUpdateAdmin(username, password);
  console.info(`Admin "${username.toLowerCase()}" saved.`);
} catch (error) {
  die(error instanceof Error ? error.message : "Could not save admin.");
}
