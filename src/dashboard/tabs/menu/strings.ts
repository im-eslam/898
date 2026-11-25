import type { MenuErrorCode } from "@api/contracts";
import type { Localized } from "@/shared/i18n";

export type MenuErrorKey =
  | MenuErrorCode
  | "UNAUTHORIZED"
  | "INVALID_INPUT"
  | "PAYLOAD_TOO_LARGE"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "HTTP_ERROR"
  | "NETWORK"
  | "TIMEOUT"
  | "UNKNOWN";

const errorsEn: Record<MenuErrorKey, string> = {
  MENU_ITEM_NOT_FOUND: "That item couldn't be found. It may already be removed.",
  MENU_REFERENCE_NOT_FOUND: "One of the selected items no longer exists.",
  MENU_DUPLICATE_REFERENCE: "The same item was selected more than once.",
  MENU_ORDER_INCOMPLETE: "The new order doesn't match the current items.",
  MENU_SINGLE_PRICE_INVALID: "A single price needs exactly one unnamed option.",
  MENU_MULTIPLE_PRICE_INVALID: "Multiple prices need at least two named options.",
  MENU_DISCOUNT_INVALID: "The discount can't be more than the price.",
  MENU_BARISTA_NOT_IN_ADD_ONS: "Barista's way options must also be selected as add-ons.",
  MENU_SELF_RELATED: "A product can't be related to itself.",
  MENU_PAIRING_ITEMS_INVALID: "Choose two different products for the pairing.",
  MENU_POPUP_IMAGE_REQUIRED: "Upload a popup image before turning the popup on.",
  MENU_IMAGE_INVALID: "Image must be a JPEG, PNG or WebP file up to 5 MB.",
  UNAUTHORIZED: "Your session has ended. Please sign in again.",
  INVALID_INPUT: "Some of the input isn't valid. Check it and try again.",
  PAYLOAD_TOO_LARGE: "The request is too large.",
  NOT_FOUND: "That couldn't be found.",
  INTERNAL_ERROR: "The server ran into a problem. Please try again.",
  HTTP_ERROR: "Something went wrong on the server. Please try again.",
  NETWORK: "No connection. Check your network and try again.",
  TIMEOUT: "The request took too long. Please try again.",
  UNKNOWN: "Something went wrong. Please try again.",
};

const errorsAr: Record<MenuErrorKey, string> = {
  MENU_ITEM_NOT_FOUND: "تعذّر العثور على هذا العنصر. ربما تم حذفه بالفعل.",
  MENU_REFERENCE_NOT_FOUND: "أحد العناصر المحددة لم يعد موجوداً.",
  MENU_DUPLICATE_REFERENCE: "تم اختيار نفس العنصر أكثر من مرة.",
  MENU_ORDER_INCOMPLETE: "الترتيب الجديد لا يطابق العناصر الحالية.",
  MENU_SINGLE_PRICE_INVALID: "السعر الواحد يحتاج خياراً واحداً فقط بدون اسم.",
  MENU_MULTIPLE_PRICE_INVALID: "الأسعار المتعددة تحتاج خيارين مُسمَّيين على الأقل.",
  MENU_DISCOUNT_INVALID: "لا يمكن أن يكون الخصم أكبر من السعر.",
  MENU_BARISTA_NOT_IN_ADD_ONS: "خيارات طريقة الباريستا يجب أن تكون ضمن الإضافات المختارة.",
  MENU_SELF_RELATED: "لا يمكن ربط المنتج بنفسه.",
  MENU_PAIRING_ITEMS_INVALID: "اختر منتجين مختلفين للثنائي.",
  MENU_POPUP_IMAGE_REQUIRED: "ارفع صورة النافذة المنبثقة قبل تفعيلها.",
  MENU_IMAGE_INVALID: "يجب أن تكون الصورة بصيغة JPEG أو PNG أو WebP وبحجم أقصى 5 ميغابايت.",
  UNAUTHORIZED: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
  INVALID_INPUT: "بعض البيانات غير صالحة. راجعها وحاول مرة أخرى.",
  PAYLOAD_TOO_LARGE: "الطلب كبير جداً.",
  NOT_FOUND: "تعذّر العثور على هذا.",
  INTERNAL_ERROR: "واجه الخادم مشكلة. حاول مرة أخرى.",
  HTTP_ERROR: "حدث خطأ في الخادم. حاول مرة أخرى.",
  NETWORK: "لا يوجد اتصال. تحقق من الشبكة وحاول مرة أخرى.",
  TIMEOUT: "استغرق الطلب وقتاً طويلاً. حاول مرة أخرى.",
  UNKNOWN: "حدث خطأ. حاول مرة أخرى.",
};

const en = {
  label: "Menu",
  title: "Menu",
  description: "Edit products, prices, categories and more.",
  loading: "Loading menu…",
  loadFailed: "Couldn't load the menu.",
  retry: "Try again",

  nav: {
    categories: "Categories & products",
    addOns: "Add-ons",
    pairings: "Pairings",
    signatures: "Signatures",
    popup: "Popup",
  },

  dialog: { close: "Close" },
  confirm: { cancel: "Cancel", loading: "Checking what's using this…" },

  common: {
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    deleting: "Deleting…",
    noCategory: "No category",
    none: "None",
    nameEn: "Name (English)",
    nameAr: "Name (Arabic)",
    moveUp: "Move up",
    moveDown: "Move down",
    saved: "Saved",
  },

  categories: {
    title: "Categories",
    description: "Group products together and control their order on the menu.",
    empty: "No categories yet.",
    add: "Add category",
    addTitle: "Add category",
    editTitle: "Edit category",
    name: "Name",
    deleteTitle: "Delete category?",
    deleteText: "This can't be undone.",
    usage: {
      products: (count: number) => `Used by ${count} product${count === 1 ? "" : "s"}.`,
    },
  },

  addOns: {
    title: "Add-ons",
    description: "Extras customers can add to products, like syrups or toppings.",
    empty: "No add-ons yet.",
    add: "Add add-on",
    addTitle: "Add add-on",
    editTitle: "Edit add-on",
    name: "Name",
    price: "Price",
    deleteTitle: "Delete add-on?",
    deleteText: "This can't be undone.",
    usage: {
      products: (count: number) => `Used by ${count} product${count === 1 ? "" : "s"}.`,
      baristaWay: (count: number) =>
        `Used in barista's way on ${count} product${count === 1 ? "" : "s"}.`,
    },
  },

  products: {
    title: "Products",
    description: "Create and edit the products shown on the menu.",
    empty: "No products in this category yet.",
    add: "Add product",
    addTitle: "Add product",
    editTitle: "Edit product",
    category: "Category",
    name: "Name",
    productDescription: "Description",
    availability: {
      label: "Availability",
      inStock: "In stock",
      outOfStock: "Out of stock",
    },
    badge: { label: "Badge", none: "None", top: "Top", new: "New" },
    pricing: {
      label: "Pricing",
      type: { single: "Single price", multiple: "Multiple sizes" },
      singlePrice: "Price",
      singleDiscount: "Discount",
      optionsLabel: "Sizes",
      addOption: "Add size",
      removeOption: "Remove size",
      optionName: "Size name",
      optionPrice: "Price",
      optionDiscount: "Discount",
    },
    addOnsField: {
      label: "Add-ons",
      searchPlaceholder: "Search add-ons",
      empty: "No add-ons yet. Create one in the Add-ons section.",
    },
    baristaWay: {
      label: "Barista's way",
      hint: "Must also be selected as an add-on above.",
      empty: "Select add-ons above first.",
    },
    related: {
      label: "Often ordered with",
      searchPlaceholder: "Search products",
      empty: "No other products yet.",
    },
    image: {
      label: "Image",
      select: "Choose image",
      change: "Change image",
      hint: "JPEG, PNG or WebP, up to 5 MB.",
    },
    imageRequired: "An image is required.",
    deleteTitle: "Delete product?",
    deleteText: "This can't be undone.",
    usage: {
      signatures: (count: number) => `Featured as a signature in ${count} place${count === 1 ? "" : "s"}.`,
      pairings: (count: number) => `Used in ${count} pairing${count === 1 ? "" : "s"}.`,
      relatedFrom: (count: number) =>
        `Listed under "often ordered with" on ${count} product${count === 1 ? "" : "s"}.`,
    },
  },

  pairings: {
    title: "Pairings",
    description: "Suggest two products together at a combined price.",
    empty: "No pairings yet.",
    add: "Add pairing",
    addTitle: "Add pairing",
    editTitle: "Edit pairing",
    firstItem: "First product",
    secondItem: "Second product",
    selectProduct: "Select a product",
    price: "Price",
    discount: "Discount",
    deleteTitle: "Delete pairing?",
    deleteText: "This can't be undone.",
  },

  signatures: {
    title: "Signatures",
    description: "Pick the products featured as signature items on the menu.",
    searchPlaceholder: "Search products",
    empty: "No products yet.",
    selectedCount: (count: number) => `${count} selected`,
    save: "Save signatures",
  },

  popup: {
    title: "Popup",
    description: "Show a promotional popup when the menu first opens.",
    enabled: "Show popup",
    delaySeconds: "Delay (seconds)",
    delayHint: "How long to wait before showing the popup.",
    image: "Popup image",
    imageHint: "JPEG, PNG or WebP, up to 5 MB.",
    save: "Save popup",
  },

  errors: errorsEn,
};

const ar: typeof en = {
  label: "القائمة",
  title: "القائمة",
  description: "عدّل المنتجات والأسعار والفئات والمزيد.",
  loading: "جارٍ تحميل القائمة…",
  loadFailed: "تعذّر تحميل القائمة.",
  retry: "حاول مرة أخرى",

  nav: {
    categories: "الفئات والمنتجات",
    addOns: "الإضافات",
    pairings: "الثنائيات",
    signatures: "المميزة",
    popup: "النافذة المنبثقة",
  },

  dialog: { close: "إغلاق" },
  confirm: { cancel: "إلغاء", loading: "جارٍ التحقق من استخدام هذا العنصر…" },

  common: {
    save: "حفظ",
    saving: "جارٍ الحفظ…",
    cancel: "إلغاء",
    add: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    deleting: "جارٍ الحذف…",
    noCategory: "بدون فئة",
    none: "بدون",
    nameEn: "الاسم (إنجليزي)",
    nameAr: "الاسم (عربي)",
    moveUp: "تحريك لأعلى",
    moveDown: "تحريك لأسفل",
    saved: "تم الحفظ",
  },

  categories: {
    title: "الفئات",
    description: "جمّع المنتجات معاً وتحكم بترتيبها في القائمة.",
    empty: "لا توجد فئات بعد.",
    add: "إضافة فئة",
    addTitle: "إضافة فئة",
    editTitle: "تعديل الفئة",
    name: "الاسم",
    deleteTitle: "حذف الفئة؟",
    deleteText: "لا يمكن التراجع عن هذا الإجراء.",
    usage: {
      products: (count: number) => `مستخدمة في ${count} منتج.`,
    },
  },

  addOns: {
    title: "الإضافات",
    description: "إضافات يمكن للعملاء اختيارها، مثل الشراب الإضافي أو التتبيلات.",
    empty: "لا توجد إضافات بعد.",
    add: "إضافة",
    addTitle: "إضافة جديدة",
    editTitle: "تعديل الإضافة",
    name: "الاسم",
    price: "السعر",
    deleteTitle: "حذف الإضافة؟",
    deleteText: "لا يمكن التراجع عن هذا الإجراء.",
    usage: {
      products: (count: number) => `مستخدمة في ${count} منتج.`,
      baristaWay: (count: number) => `مستخدمة في طريقة الباريستا لـ ${count} منتج.`,
    },
  },

  products: {
    title: "المنتجات",
    description: "أنشئ وعدّل المنتجات الظاهرة في القائمة.",
    empty: "لا توجد منتجات في هذه الفئة بعد.",
    add: "إضافة منتج",
    addTitle: "إضافة منتج",
    editTitle: "تعديل المنتج",
    category: "الفئة",
    name: "الاسم",
    productDescription: "الوصف",
    availability: {
      label: "التوفر",
      inStock: "متوفر",
      outOfStock: "غير متوفر",
    },
    badge: { label: "الشارة", none: "بدون", top: "الأكثر طلباً", new: "جديد" },
    pricing: {
      label: "التسعير",
      type: { single: "سعر واحد", multiple: "أحجام متعددة" },
      singlePrice: "السعر",
      singleDiscount: "الخصم",
      optionsLabel: "الأحجام",
      addOption: "إضافة حجم",
      removeOption: "إزالة الحجم",
      optionName: "اسم الحجم",
      optionPrice: "السعر",
      optionDiscount: "الخصم",
    },
    addOnsField: {
      label: "الإضافات",
      searchPlaceholder: "ابحث في الإضافات",
      empty: "لا توجد إضافات بعد. أنشئ واحدة من قسم الإضافات.",
    },
    baristaWay: {
      label: "طريقة الباريستا",
      hint: "يجب اختيارها ضمن الإضافات أعلاه أولاً.",
      empty: "اختر الإضافات أعلاه أولاً.",
    },
    related: {
      label: "غالباً يُطلب مع",
      searchPlaceholder: "ابحث في المنتجات",
      empty: "لا توجد منتجات أخرى بعد.",
    },
    image: {
      label: "الصورة",
      select: "اختر صورة",
      change: "تغيير الصورة",
      hint: "بصيغة JPEG أو PNG أو WebP، بحجم أقصى 5 ميغابايت.",
    },
    imageRequired: "الصورة مطلوبة.",
    deleteTitle: "حذف المنتج؟",
    deleteText: "لا يمكن التراجع عن هذا الإجراء.",
    usage: {
      signatures: (count: number) => `مميز في ${count} مكان.`,
      pairings: (count: number) => `مستخدم في ${count} ثنائي.`,
      relatedFrom: (count: number) => `ظاهر ضمن "غالباً يُطلب مع" في ${count} منتج.`,
    },
  },

  pairings: {
    title: "الثنائيات",
    description: "اقترح منتجين معاً بسعر مجمّع.",
    empty: "لا توجد ثنائيات بعد.",
    add: "إضافة ثنائي",
    addTitle: "إضافة ثنائي",
    editTitle: "تعديل الثنائي",
    firstItem: "المنتج الأول",
    secondItem: "المنتج الثاني",
    selectProduct: "اختر منتجاً",
    price: "السعر",
    discount: "الخصم",
    deleteTitle: "حذف الثنائي؟",
    deleteText: "لا يمكن التراجع عن هذا الإجراء.",
  },

  signatures: {
    title: "المنتجات المميزة",
    description: "اختر المنتجات التي تظهر كمنتجات مميزة في القائمة.",
    searchPlaceholder: "ابحث في المنتجات",
    empty: "لا توجد منتجات بعد.",
    selectedCount: (count: number) => `تم اختيار ${count}`,
    save: "حفظ المميزة",
  },

  popup: {
    title: "النافذة المنبثقة",
    description: "أظهر نافذة ترويجية عند فتح القائمة لأول مرة.",
    enabled: "إظهار النافذة",
    delaySeconds: "التأخير (ثوانٍ)",
    delayHint: "مدة الانتظار قبل إظهار النافذة.",
    image: "صورة النافذة",
    imageHint: "بصيغة JPEG أو PNG أو WebP، بحجم أقصى 5 ميغابايت.",
    save: "حفظ النافذة",
  },

  errors: errorsAr,
};

export const strings: Localized<typeof en> = { en, ar };
