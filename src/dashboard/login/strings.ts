import type { Localized } from "@/shared/i18n";

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
    invalidCredentials: "Wrong username or password.",
    network: "No internet connection. Check your network and try again.",
    timeout: "Signing in took too long. Please try again.",
    invalidInput: "Please check your username and password and try again.",
    tooLarge:
      "The information you entered is too long. Please shorten it and try again.",
    server: "We couldn't sign you in right now. Please try again later.",
  },
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
    invalidCredentials: "اسم المستخدم أو كلمة المرور غير صحيحة.",
    network: "لا يوجد اتصال بالإنترنت. تحقق من الشبكة وحاول مرة أخرى.",
    timeout: "استغرق تسجيل الدخول وقتاً طويلاً. حاول مرة أخرى.",
    invalidInput:
      "يرجى التحقق من اسم المستخدم وكلمة المرور والمحاولة مرة أخرى.",
    tooLarge: "المعلومات المدخلة طويلة جداً. يرجى تقصيرها والمحاولة مرة أخرى.",
    server: "تعذّر تسجيل دخولك الآن. حاول مرة أخرى لاحقاً.",
  },
};

export const strings: Localized<typeof en> = { en, ar };
