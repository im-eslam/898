import { ADMIN_LIMITS } from "@api/contracts";
import type { Localized } from "@/shared/i18n";

const en = {
  label: "Settings",
  title: "Settings",
  sections: {
    language: "Language",
    username: "Username",
    password: "Password",
  },
  fields: {
    language: "Dashboard language",
    username: "Username",
    usernameCurrentPassword: "Current password",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
  },
  hints: {
    username: `${ADMIN_LIMITS.username.min} to ${ADMIN_LIMITS.username.max} letters, digits, dots, underscores or dashes.`,
    usernameCurrentPassword: "Needed to change your username.",
    currentPassword: "Needed to set a new password.",
    newPassword: `At least ${ADMIN_LIMITS.password.min} characters.`,
  },
  languages: { en: "English", ar: "العربية" },
  showPassword: "Show password",
  hidePassword: "Hide password",
  actions: {
    save: "Save",
    saving: "Saving…",
  },
  validation: {
    passwordMismatch: "The new passwords do not match.",
  },
  toast: {
    saved: {
      language: "Language saved.",
      username: "Username updated.",
      password: "Password updated.",
    },
    invalidCredentials: "Current password is incorrect.",
    usernameTaken: "That username is already taken.",
    invalidInput: "Please check the details and try again.",
    unauthorized: "Your session has expired. Please sign in again.",
    network: "No internet connection. Check your network and try again.",
    timeout: "Saving took too long. Please try again.",
    server: "We couldn't save your changes. Please try again later.",
  },
};

const ar: typeof en = {
  label: "الإعدادات",
  title: "الإعدادات",
  sections: {
    language: "اللغة",
    username: "اسم المستخدم",
    password: "كلمة المرور",
  },
  fields: {
    language: "لغة لوحة التحكم",
    username: "اسم المستخدم",
    usernameCurrentPassword: "كلمة المرور الحالية",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور الجديدة",
  },
  hints: {
    username: `من ${ADMIN_LIMITS.username.min} إلى ${ADMIN_LIMITS.username.max} حرفاً أو رقماً أو نقطة أو شرطة سفلية أو شرطة.`,
    usernameCurrentPassword: "مطلوبة لتغيير اسم المستخدم.",
    currentPassword: "مطلوبة لتعيين كلمة مرور جديدة.",
    newPassword: `يجب أن تتكون من ${ADMIN_LIMITS.password.min} أحرف على الأقل.`,
  },
  languages: { en: "الإنجليزية", ar: "العربية" },
  showPassword: "إظهار كلمة المرور",
  hidePassword: "إخفاء كلمة المرور",
  actions: {
    save: "حفظ",
    saving: "جارٍ الحفظ…",
  },
  validation: {
    passwordMismatch: "كلمتا المرور الجديدتان غير متطابقتين.",
  },
  toast: {
    saved: {
      language: "تم حفظ اللغة.",
      username: "تم تحديث اسم المستخدم.",
      password: "تم تحديث كلمة المرور.",
    },
    invalidCredentials: "كلمة المرور الحالية غير صحيحة.",
    usernameTaken: "اسم المستخدم هذا مستخدم بالفعل.",
    invalidInput: "يرجى التحقق من البيانات والمحاولة مرة أخرى.",
    unauthorized: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
    network: "لا يوجد اتصال بالإنترنت. تحقق من الشبكة وحاول مرة أخرى.",
    timeout: "استغرق الحفظ وقتاً طويلاً. حاول مرة أخرى.",
    server: "تعذّر حفظ التغييرات. حاول مرة أخرى لاحقاً.",
  },
};

export const strings: Localized<typeof en> = { en, ar };
