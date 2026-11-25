import {
  adminService,
  findPasswordError,
  isValidUsername,
  type PasswordRuleError,
} from "../features/admin/service.js";

const PASSWORD_ERROR_MESSAGES: Record<PasswordRuleError, string> = {
  PASSWORD_TOO_SHORT: "Password must be at least 10 characters.",
  PASSWORD_TOO_LONG: "Password must be at most 72 bytes.",
  PASSWORD_SAME_AS_USERNAME: "Password must not equal the username.",
};

function die(message: string): never {
  console.error(message);
  process.exit(1);
}

const [username, password] = process.argv.slice(2);

if (!username || !password)
  die("Usage: npm run db:admin -- <username> <password>");

if (!isValidUsername(username))
  die(
    "Username must be 3-50 characters: letters, digits, dot, underscore, dash."
  );

const passwordError = findPasswordError(password, username);
if (passwordError) die(PASSWORD_ERROR_MESSAGES[passwordError]);

try {
  const existingId = await adminService.findAdminIdByUsername(username);
  if (existingId !== null) {
    await adminService.updatePassword(existingId, password);
    console.info(`Password reset for "${username.toLowerCase()}".`);
  } else {
    const admin = await adminService.createAdmin(username, password);
    if (!admin) die(`Admin "${username.toLowerCase()}" already exists.`);
    console.info(`Admin "${username.toLowerCase()}" created.`);
  }
  process.exit(0);
} catch (error) {
  die(error instanceof Error ? error.message : "Could not save admin.");
}
