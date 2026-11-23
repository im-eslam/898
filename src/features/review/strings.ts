import type { Localized } from "@/shared/i18n";

const en = {
  common: {
    close: "Close",
  },
  drawer: {
    title: "How was it?",
    description: "Submit your review or share feedback.",
  },
  choices: {
    google: {
      title: "Loved it!",
      hint: "Share your experience",
    },
    note: {
      title: "I have a suggestion",
      hint: "Help us improve",
    },
  },
  form: {
    fields: {
      message: { label: "How can we make it better?" },
      name: { label: "Name (optional)" },
      contact: { label: "Phone or email (optional)" },
    },
    validation: {
      required: "Please write your review.",
      tooShort: "Your review must be at least 3 characters.",
    },
    actions: {
      send: "Send Feedback",
      sending: "Sending…",
    },
    errors: {
      unknown: "Something went wrong. Please try again.",
      network:
        "No internet connection. Please check your network and try again.",
      invalidInput: "Please check your message and try again.",
      timeout:
        "The request took too long, so we can't confirm your feedback was sent. Close this window and send again only if you're sure it didn't go through.",
      server:
        "We couldn't send your feedback right now. Please try again later.",
    },
  },
  success: {
    title: "Feedback sent",
    message: "Thank you! We truly value your thoughts.",
  },
};

const ar: typeof en = {
  common: {
    close: "إغلاق",
  },
  drawer: {
    title: "كيف كانت تجربتك؟",
    description: "أرسل تقييمك أو شارك ملاحظاتك.",
  },
  choices: {
    google: {
      title: "كل شيء كان رائعاً!",
      hint: "شارك تجربتك",
    },
    note: {
      title: "لدي بعض الملاحظات",
      hint: "ساعدنا لنقدم لك الأفضل",
    },
  },
  form: {
    fields: {
      message: { label: "كيف يمكننا التحسن؟" },
      name: { label: "الاسم (اختياري)" },
      contact: { label: "الهاتف أو البريد (اختياري)" },
    },
    validation: {
      required: "يرجى كتابة تقييمك.",
      tooShort: "يجب أن يتكون تقييمك من 3 أحرف على الأقل.",
    },
    actions: {
      send: "إرسال الملاحظات",
      sending: "جارٍ الإرسال…",
    },
    errors: {
      unknown: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
      network:
        "لا يوجد اتصال بالإنترنت. يرجى التحقق من الشبكة والمحاولة مرة أخرى.",
      invalidInput: "يرجى مراجعة رسالتك والمحاولة مرة أخرى.",
      timeout:
        "استغرق الطلب وقتًا أطول من المتوقع، لذلك لا نستطيع التأكد من وصول ملاحظاتك. أغلق هذه النافذة وأعد الإرسال فقط إذا كنت متأكدًا أنها لم تصل.",
      server: "تعذر إرسال ملاحظاتك الآن. يرجى المحاولة لاحقًا.",
    },
  },
  success: {
    title: "تم إرسال الملاحظات",
    message: "شكرًا لك! نحن نقدر ملاحظاتك جداً.",
  },
};

export const strings: Localized<typeof en> = { en, ar };
