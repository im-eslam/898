import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminDto, AdminLanguage, ApiResponse } from "@api/contracts";
import type { ApiError, ErrorKey } from "@/shared/api";
import { setLocale } from "@/shared/i18n";
import { sessionKey } from "../../../hooks/use-session";
import { updateAccount, type AccountUpdate } from "../api/user";

export type AccountField = "username" | "currentPassword" | "newPassword";

type Draft = {
  username: string;
  language: AdminLanguage;
  newPassword: string;
  currentPassword: string;
};

const FIELD_FOR: Partial<Record<ErrorKey, AccountField>> = {
  USERNAME_INVALID: "username",
  USERNAME_TAKEN: "username",
  CURRENT_PASSWORD_REQUIRED: "currentPassword",
  WRONG_CURRENT_PASSWORD: "currentPassword",
  PASSWORD_TOO_SHORT: "newPassword",
  PASSWORD_TOO_LONG: "newPassword",
  PASSWORD_SAME_AS_USERNAME: "newPassword",
};

function buildAccountUpdate(admin: AdminDto, draft: Draft): AccountUpdate {
  const body: AccountUpdate = {};

  const username = draft.username.trim().toLowerCase();
  if (username !== admin.username) body.username = username;
  if (draft.language !== admin.language) body.language = draft.language;
  if (draft.newPassword) body.newPassword = draft.newPassword;

  if (body.username !== undefined || body.newPassword !== undefined) {
    body.currentPassword = draft.currentPassword;
  }

  return body;
}

export function useAccountForm(admin: AdminDto) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>({
    username: admin.username,
    language: admin.language,
    newPassword: "",
    currentPassword: "",
  });

  const mutation = useMutation<
    ApiResponse<"PATCH /api/admin/me">,
    ApiError,
    AccountUpdate
  >({
    mutationFn: updateAccount,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(sessionKey, user);
      setLocale(user.language);
      setDraft({
        username: user.username,
        language: user.language,
        newPassword: "",
        currentPassword: "",
      });
    },
    onError: (error) => {
      if (error.code === "UNAUTHORIZED") {
        void queryClient.invalidateQueries({ queryKey: sessionKey });
      }
    },
  });

  const errorCode = mutation.error?.code;
  const failedField = errorCode ? FIELD_FOR[errorCode] : undefined;

  return {
    draft,
    isPending: mutation.isPending,
    errorCode,
    failedField,
    generalError: errorCode && !failedField ? errorCode : null,

    update: (patch: Partial<Draft>) => {
      setDraft((d) => ({ ...d, ...patch }));
      if (mutation.error) mutation.reset();
    },

    save: (onSuccess: () => void): boolean => {
      if (mutation.isPending) return true;
      const body = buildAccountUpdate(admin, draft);
      if (Object.keys(body).length === 0) return false;
      mutation.mutate(body, { onSuccess });
      return true;
    },
  };
}
