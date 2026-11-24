import {
  adminService,
  assertValidPassword,
  assertValidUsername,
} from "../features/admin/service.js";

function die(message: string): never {
  console.error(message);
  process.exit(1);
}

const [username, password] = process.argv.slice(2);

if (!username || !password)
  die("Usage: npm run db:admin -- <username> <password>");

try {
  assertValidUsername(username);
  assertValidPassword(password, username);

  const existingId = await adminService.findAdminIdByUsername(username);
  if (existingId !== null) {
    await adminService.updatePassword(existingId, password);
    console.info(`Password reset for "${username.toLowerCase()}".`);
  } else {
    await adminService.createAdmin(username, password);
    console.info(`Admin "${username.toLowerCase()}" created.`);
  }
  process.exit(0);
} catch (error) {
  die(error instanceof Error ? error.message : "Could not save admin.");
}
