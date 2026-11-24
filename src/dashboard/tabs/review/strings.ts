import type { ApiErrorKey } from "@/shared/api";
import type { Localized } from "@/shared/i18n";

export type ReviewErrorKey =
  | ApiErrorKey<"GET /api/admin/reviews">
  | ApiErrorKey<"POST /api/admin/reviews/delete">
  | "NETWORK"
  | "TIMEOUT"
  | "UNKNOWN";

const en = {
  label: "Reviews",
  title: "Reviews",
  loading: "Loading reviews…",
  loadFailed: "Couldn't load reviews.",
  retry: "Try again",
  empty: "No reviews yet.",
  noResults: "No reviews match your search.",
  search: {
    label: "Search reviews",
    placeholder: "Search by name, contact, or message",
    clear: "Clear search",
  },
  bulk: {
    region: "Selected reviews",
    selected: "{count} selected",
    selectAll: "Select all on this page",
    clear: "Clear selection",
    delete: "Delete selected",
  },
  table: {
    selectAll: "Select all reviews on this page",
    selectRow: "Select review from {name}",
    name: "Name",
    contact: "Contact",
    message: "Message",
    date: "Date",
    actions: "Actions",
  },
  hint: {
    longPress: "Tap a review to open it. Long press or tick the box to select.",
  },
  review: {
    open: "Open review",
    anonymous: "Anonymous",
    noContact: "No contact",
  },
  pagination: {
    label: "Pagination",
    previous: "Previous",
    next: "Next",
    info: "Page {page} of {total}",
  },
  dialog: {
    close: "Close",
    delete: "Delete review",
  },
  confirm: {
    title: "Delete review?",
    titleMany: "Delete {count} reviews?",
    text: "This can't be undone.",
    cancel: "Cancel",
    confirm: "Delete",
    deleting: "Deleting…",
  },
  toast: {
    deleted: "Reviews deleted",
  },
  errors: {
    INVALID_INPUT: "Some of the input isn't valid. Check it and try again.",
    UNAUTHORIZED: "Your session has ended. Please sign in again.",
    PAYLOAD_TOO_LARGE: "The request is too large. Try again with less text.",
    INTERNAL_ERROR: "The server ran into a problem. Please try again.",
    HTTP_ERROR: "Something went wrong on the server. Please try again.",
    NETWORK: "No connection. Check your network and try again.",
    TIMEOUT: "The request took too long. Please try again.",
    UNKNOWN: "Something went wrong. Please try again.",
  } satisfies Record<ReviewErrorKey, string>,
};

const ar: typeof en = {
  label: "التقييمات",
  title: "التقييمات",
  loading: "جارٍ تحميل التقييمات…",
  loadFailed: "تعذّر تحميل التقييمات.",
  retry: "حاول مرة أخرى",
  empty: "لا توجد تقييمات بعد.",
  noResults: "لا توجد تقييمات تطابق بحثك.",
  search: {
    label: "البحث في التقييمات",
    placeholder: "ابحث بالاسم أو وسيلة التواصل أو الرسالة",
    clear: "مسح البحث",
  },
  bulk: {
    region: "التقييمات المحددة",
    selected: "تم تحديد {count}",
    selectAll: "تحديد الكل في هذه الصفحة",
    clear: "إلغاء التحديد",
    delete: "حذف المحدد",
  },
  table: {
    selectAll: "تحديد كل التقييمات في هذه الصفحة",
    selectRow: "تحديد التقييم من {name}",
    name: "الاسم",
    contact: "وسيلة التواصل",
    message: "الرسالة",
    date: "التاريخ",
    actions: "الإجراءات",
  },
  hint: {
    longPress: "اضغط على تقييم لفتحه. اضغط مطولاً أو حدد المربع للاختيار.",
  },
  review: {
    open: "فتح التقييم",
    anonymous: "مجهول",
    noContact: "لا توجد وسيلة تواصل",
  },
  pagination: {
    label: "التنقل بين الصفحات",
    previous: "السابق",
    next: "التالي",
    info: "الصفحة {page} من {total}",
  },
  dialog: {
    close: "إغلاق",
    delete: "حذف التقييم",
  },
  confirm: {
    title: "حذف التقييم؟",
    titleMany: "حذف {count} تقييمات؟",
    text: "لا يمكن التراجع عن هذا الإجراء.",
    cancel: "إلغاء",
    confirm: "حذف",
    deleting: "جارٍ الحذف…",
  },
  toast: {
    deleted: "تم حذف التقييمات",
  },
  errors: {
    INVALID_INPUT: "بعض البيانات غير صالحة. راجعها وحاول مرة أخرى.",
    UNAUTHORIZED: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
    PAYLOAD_TOO_LARGE: "الطلب كبير جداً. حاول بنص أقصر.",
    INTERNAL_ERROR: "واجه الخادم مشكلة. حاول مرة أخرى.",
    HTTP_ERROR: "حدث خطأ في الخادم. حاول مرة أخرى.",
    NETWORK: "لا يوجد اتصال. تحقق من الشبكة وحاول مرة أخرى.",
    TIMEOUT: "استغرق الطلب وقتاً طويلاً. حاول مرة أخرى.",
    UNKNOWN: "حدث خطأ. حاول مرة أخرى.",
  },
};

export const strings: Localized<typeof en> = { en, ar };
