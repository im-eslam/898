import type { Localized } from "@/shared/i18n";
import type { ApiErrorKey } from "@/shared/api";

export type AccountErrorKey =
  ApiErrorKey<"PATCH /api/admin/me"> | "NETWORK" | "TIMEOUT" | "UNKNOWN";

const en = {
  label: "Settings",
  title: "Settings",
  description: "Update your username, language, and password.",
  account: {
    username: "Username",
    usernameHint: "3–50 characters: letters, digits, dot, underscore or dash.",
    language: {
      label: "Language",
      en: "English",
      ar: "العربية",
    },
  },
  password: {
    new: "New password",
    newHint:
      "At least 10 characters. Leave empty to keep your current password.",
    show: "Show password",
    hide: "Hide password",
  },
  current: {
    label: "Current password",
    hint: "Required to change your username or password.",
  },
  form: {
    noChanges: "No changes to save.",
    saved: "Your changes have been saved.",
  },
  actions: {
    save: "Save changes",
    saving: "Saving…",
  },
  errors: {
    INVALID_INPUT: "Please check the form and try again.",
    UNAUTHORIZED: "Your session has ended. Please sign in again.",
    NOTHING_TO_UPDATE: "There are no changes to save.",
    CURRENT_PASSWORD_REQUIRED:
      "Enter your current password to make this change.",
    WRONG_CURRENT_PASSWORD: "The current password is incorrect.",
    USERNAME_INVALID:
      "Username must be 3–50 characters: letters, digits, dot, underscore or dash.",
    USERNAME_TAKEN: "That username is already taken.",
    PASSWORD_TOO_SHORT: "New password must be at least 10 characters.",
    PASSWORD_TOO_LONG:
      "New password is too long. Use at most 72 bytes. Arabic and other non-Latin characters take more than one byte each.",
    PASSWORD_SAME_AS_USERNAME:
      "Your password cannot be the same as your username.",
    PAYLOAD_TOO_LARGE: "The information you entered is too long.",
    INTERNAL_ERROR:
      "We couldn't save your changes right now. Please try again later.",
    HTTP_ERROR:
      "We couldn't save your changes right now. Please try again later.",
    NETWORK: "No internet connection. Check your network and try again.",
    TIMEOUT: "Saving took too long. Please try again.",
    UNKNOWN: "Something unexpected happened. Please try again.",
  } satisfies Record<AccountErrorKey, string>,
};

const ar: typeof en = {
  label: "الإعدادات",
  title: "الإعدادات",
  description: "حدّث اسم المستخدم واللغة وكلمة المرور.",
  account: {
    username: "اسم المستخدم",
    usernameHint:
      "من 3 إلى 50 حرفاً: أحرف إنجليزية وأرقام ونقطة وشرطة سفلية أو شرطة.",
    language: {
      label: "اللغة",
      en: "English",
      ar: "العربية",
    },
  },
  password: {
    new: "كلمة المرور الجديدة",
    newHint: "10 أحرف على الأقل. اتركها فارغة للإبقاء على كلمة المرور الحالية.",
    show: "إظهار كلمة المرور",
    hide: "إخفاء كلمة المرور",
  },
  current: {
    label: "كلمة المرور الحالية",
    hint: "مطلوبة لتغيير اسم المستخدم أو كلمة المرور.",
  },
  form: {
    noChanges: "لا توجد تغييرات لحفظها.",
    saved: "تم حفظ التغييرات.",
  },
  actions: {
    save: "حفظ التغييرات",
    saving: "جارٍ الحفظ…",
  },
  errors: {
    INVALID_INPUT: "يرجى مراجعة البيانات والمحاولة مرة أخرى.",
    UNAUTHORIZED: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
    NOTHING_TO_UPDATE: "لا توجد تغييرات لحفظها.",
    CURRENT_PASSWORD_REQUIRED: "أدخل كلمة المرور الحالية لإجراء هذا التغيير.",
    WRONG_CURRENT_PASSWORD: "كلمة المرور الحالية غير صحيحة.",
    USERNAME_INVALID:
      "يجب أن يكون اسم المستخدم من 3 إلى 50 حرفاً: أحرف إنجليزية وأرقام ونقطة وشرطة سفلية أو شرطة.",
    USERNAME_TAKEN: "اسم المستخدم مستخدم بالفعل.",
    PASSWORD_TOO_SHORT:
      "يجب أن تتكون كلمة المرور الجديدة من 10 أحرف على الأقل.",
    PASSWORD_TOO_LONG:
      "كلمة المرور الجديدة طويلة جداً. استخدم 72 بايت كحد أقصى، فالأحرف العربية وغيرها من الأحرف غير اللاتينية تأخذ أكثر من بايت واحد.",
    PASSWORD_SAME_AS_USERNAME:
      "لا يمكن أن تكون كلمة المرور مطابقة لاسم المستخدم.",
    PAYLOAD_TOO_LARGE: "المعلومات المدخلة طويلة جداً.",
    INTERNAL_ERROR: "تعذّر حفظ التغييرات الآن. حاول مرة أخرى لاحقاً.",
    HTTP_ERROR: "تعذّر حفظ التغييرات الآن. حاول مرة أخرى لاحقاً.",
    NETWORK: "لا يوجد اتصال بالإنترنت. تحقق من الشبكة وحاول مرة أخرى.",
    TIMEOUT: "استغرق الحفظ وقتاً طويلاً. حاول مرة أخرى.",
    UNKNOWN: "حدث خطأ غير متوقع. حاول مرة أخرى.",
  },
};

export const strings: Localized<typeof en> = { en, ar };
