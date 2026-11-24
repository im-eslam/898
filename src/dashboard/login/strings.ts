import type { ApiErrorCode } from "@api/contracts";
import type { Localized } from "@/shared/i18n";

export type LoginErrorKey =
  ApiErrorCode<"POST /api/admin/login"> | "NETWORK" | "TIMEOUT" | "UNKNOWN";

const en = {
  heading: "Admin sign in",
  fields: {
    username: "Username",
    password: "Password",
  },
  passwordToggle: {
    show: "Show password",
    hide: "Hide password",
  },
  actions: {
    submit: "Sign in",
    submitting: "Signing in…",
  },
  errors: {
    INVALID_CREDENTIALS: "Wrong username or password.",
    PAYLOAD_TOO_LARGE:
      "The information you entered is too long. Please shorten it and try again.",
    INTERNAL_ERROR:
      "We couldn't sign you in right now. Please try again later.",
    HTTP_ERROR: "We couldn't sign you in right now. Please try again later.",
    NETWORK: "No internet connection. Check your network and try again.",
    TIMEOUT: "Signing in took too long. Please try again.",
    UNKNOWN: "We couldn't sign you in right now. Please try again later.",
  } satisfies Record<LoginErrorKey, string>,
};

const ar: typeof en = {
  heading: "تسجيل دخول الإدارة",
  fields: {
    username: "اسم المستخدم",
    password: "كلمة المرور",
  },
  passwordToggle: {
    show: "إظهار كلمة المرور",
    hide: "إخفاء كلمة المرور",
  },
  actions: {
    submit: "تسجيل الدخول",
    submitting: "جارٍ تسجيل الدخول…",
  },
  errors: {
    INVALID_CREDENTIALS: "اسم المستخدم أو كلمة المرور غير صحيحة.",
    PAYLOAD_TOO_LARGE:
      "المعلومات المدخلة طويلة جداً. يرجى تقصيرها والمحاولة مرة أخرى.",
    INTERNAL_ERROR: "تعذّر تسجيل دخولك الآن. حاول مرة أخرى لاحقاً.",
    HTTP_ERROR: "تعذّر تسجيل دخولك الآن. حاول مرة أخرى لاحقاً.",
    NETWORK: "لا يوجد اتصال بالإنترنت. تحقق من الشبكة وحاول مرة أخرى.",
    TIMEOUT: "استغرق تسجيل الدخول وقتاً طويلاً. حاول مرة أخرى.",
    UNKNOWN: "تعذّر تسجيل دخولك الآن. حاول مرة أخرى لاحقاً.",
  },
};

export const strings: Localized<typeof en> = { en, ar };
