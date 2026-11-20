import { z } from "zod";
import { adminLimits } from "./schema.js";

const loginSchema = z.object({
  username: z.string().trim().max(adminLimits.username.max),
  password: z.string().min(1).max(adminLimits.password.max),
});

function assertValidNewAdmin(username: string, password: string): void {
  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) {
    throw new Error("Username must be 3-50 characters: letters, digits, dot, underscore, dash.");
  }

  const passwordMatchesUsername = password.toLowerCase() === username.toLowerCase();
  if (password.length < 10 || password.length > adminLimits.password.max || passwordMatchesUsername) {
    throw new Error(
      `Password must be 10-${adminLimits.password.max} characters and must not equal the username.`,
    );
  }
}

export const adminValidation = {
  login: loginSchema,
  assertNewAdmin: assertValidNewAdmin,
} as const;
