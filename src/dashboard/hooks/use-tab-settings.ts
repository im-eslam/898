import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminDto, AdminLanguage, MeResponse } from "@api/contracts";
import type { ErrorKey } from "@/shared/api";
import { ApiError } from "@/shared/api/data";
import { setLocale } from "@/shared/i18n";
import { requestUpdateAdmin, type UpdateAdminPayload } from "../api/user";
import { sessionKey } from "./use-session";

export type SettingsSection = "language" | "username" | "password";

export interface SettingsValues {
  language: AdminLanguage;
  username: string;
  usernameCurrentPassword: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type SaveResult = { ok: true } | { ok: false; code: ErrorKey | null };

function toValues(admin: AdminDto): SettingsValues {
  return {
    language: admin.language,
    username: admin.username,
    usernameCurrentPassword: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

function toPayload(
  section: SettingsSection,
  values: SettingsValues
): UpdateAdminPayload {
  switch (section) {
    case "language":
      return { language: values.language };
    case "username":
      return {
        username: values.username,
        currentPassword: values.usernameCurrentPassword || undefined,
      };
    case "password":
      return {
        currentPassword: values.currentPassword || undefined,
        newPassword: values.newPassword,
      };
  }
}

function resetFor(
  section: SettingsSection,
  user: AdminDto
): Partial<SettingsValues> {
  switch (section) {
    case "language":
      return { language: user.language };
    case "username":
      return { username: user.username, usernameCurrentPassword: "" };
    case "password":
      return { currentPassword: "", newPassword: "", confirmPassword: "" };
  }
}

export function useTabSettings(admin: AdminDto) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState(() => toValues(admin));

  const mutation = useMutation<MeResponse, ApiError, UpdateAdminPayload>({
    mutationFn: requestUpdateAdmin,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(sessionKey, user);
      setLocale(user.language);
    },
    onError: (error) => {
      if (error.code === "UNAUTHORIZED") {
        queryClient.setQueryData(sessionKey, null);
      }
    },
  });

  const setField = <K extends keyof SettingsValues>(
    key: K,
    value: SettingsValues[K]
  ) => setValues((current) => ({ ...current, [key]: value }));

  const save = async (section: SettingsSection): Promise<SaveResult> => {
    try {
      const { user } = await mutation.mutateAsync(toPayload(section, values));
      setValues((current) => ({ ...current, ...resetFor(section, user) }));
      return { ok: true };
    } catch (error) {
      return { ok: false, code: error instanceof ApiError ? error.code : null };
    }
  };

  return {
    values,
    setField,
    save,
    isSaving: mutation.isPending,
    isDirty: {
      language: values.language !== admin.language,
      username: values.username.toLowerCase() !== admin.username,
      password: values.newPassword !== "",
    } satisfies Record<SettingsSection, boolean>,
  };
}
