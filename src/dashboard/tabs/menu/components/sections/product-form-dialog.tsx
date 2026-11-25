import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminAddOn, AdminCategory, AdminProduct, AdminProductInput, LocalizedText, MenuBadge } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { useObjectUrl } from "../../hooks/use-object-url";
import { productImageUrl } from "../../lib/image-url";
import { strings } from "../../strings";
import { ImageField } from "../fields/image-field";
import { LocalizedTextField } from "../fields/localized-text-field";
import { PickerList, type PickerItem } from "../fields/picker-list";
import { PickerSummaryField } from "../fields/picker-summary-field";
import { SelectField } from "../fields/select-field";
import { ToggleField } from "../fields/toggle-field";
import { FormFooter } from "../form-footer";
import { MenuDialog } from "../menu-dialog";
import { PricingEditor } from "./pricing-editor";

const EMPTY_TEXT: LocalizedText = { en: "", ar: "" };
const NO_CATEGORY = "none";
const NO_BADGE = "none";

function defaultInput(categoryId: number | null): AdminProductInput {
  return {
    categoryId,
    name: EMPTY_TEXT,
    description: EMPTY_TEXT,
    isAvailable: true,
    badge: null,
    pricing: { type: "single", options: [{ name: null, price: 0, discount: 0 }] },
    addOnIds: [],
    baristaWayAddOnIds: [],
    oftenOrderedWithIds: [],
  };
}

// Ids that no longer exist (a deleted add-on or product) are dropped, and a product is never
// related to itself. Otherwise they stay selected, invisible, and the server rejects the save.
function keepKnown(ids: number[], known: ReadonlySet<number>): number[] {
  return ids.filter((id) => known.has(id));
}

function toInput(product: AdminProduct, addOnIds: ReadonlySet<number>, productIds: ReadonlySet<number>): AdminProductInput {
  const chosenAddOns = keepKnown(product.addOnIds, addOnIds);
  return {
    categoryId: product.categoryId,
    name: product.name,
    description: product.description,
    isAvailable: product.isAvailable,
    badge: product.badge,
    pricing: product.pricing,
    addOnIds: chosenAddOns,
    baristaWayAddOnIds: keepKnown(product.baristaWayAddOnIds, new Set(chosenAddOns)),
    oftenOrderedWithIds: keepKnown(product.oftenOrderedWithIds, productIds).filter((id) => id !== product.id),
  };
}

interface ProductFormDialogProps {
  isOpen: boolean;
  initial: AdminProduct | null;
  defaultCategoryId: number | null;
  categories: AdminCategory[];
  addOns: AdminAddOn[];
  otherProducts: { id: number; label: string }[];
  isSaving: boolean;
  error?: string;
  onClose: () => void;
  onSave: (input: AdminProductInput, image: File | null) => void;
}

// Layout uses the dialog's own width (@2xl, @sm on the columns) rather than the screen,
// so the two-column form only appears when the dialog really has room for it.
const STYLES = {
  stack: "flex flex-col gap-8",
  // Every section is a labelled block with the same top rule and gap, so the form reads in order.
  section: "flex flex-col gap-5",
  sectionTitle: "text-small font-bold uppercase tracking-wide text-navy/70",
  columns: "grid items-start gap-8 @2xl:grid-cols-2",
  column: "@container flex min-w-0 flex-col gap-5",
  pairRow: "grid items-start gap-5 @sm:grid-cols-2",
  lists: "grid items-start gap-8 @2xl:grid-cols-2",
  fullWidth: "@2xl:col-span-2",
} as const;

type PickerKey = "addOns" | "barista" | "related";

export function ProductFormDialog({
  isOpen,
  initial,
  defaultCategoryId,
  categories,
  addOns,
  otherProducts,
  isSaving,
  error,
  onClose,
  onSave,
}: ProductFormDialogProps) {
  const s = useStrings(strings);
  const [input, setInput] = useState<AdminProductInput>(() =>
    initial
      ? toInput(initial, new Set(addOns.map((a) => a.id)), new Set(otherProducts.map((p) => p.id)))
      : defaultInput(defaultCategoryId)
  );
  // Which list is being picked, or null for the main form. The picker replaces the form inside
  // the same dialog, so there is never a dialog on top of a dialog. The draft is applied on Done.
  const [picker, setPicker] = useState<PickerKey | null>(null);
  const [draftIds, setDraftIds] = useState<number[]>([]);
  const listsRef = useRef<HTMLDivElement>(null);
  const wasPickingRef = useRef(false);

  // Coming back from a picker, show the lists section again instead of the top of the form.
  useEffect(() => {
    if (picker === null && wasPickingRef.current) listsRef.current?.scrollIntoView({ block: "center" });
    wasPickingRef.current = picker !== null;
  }, [picker]);
  const [pickedImage, setPickedImage] = useState<File | null>(null);
  const pickedUrl = useObjectUrl(pickedImage);
  const existingImageUrl = initial?.image ? productImageUrl(initial.image) : null;
  const previewUrl = pickedUrl ?? existingImageUrl;

  // Option lists are memoised. They used to be rebuilt on every keystroke, which
  // re-filtered every checklist and re-rendered every dropdown.
  const categoryOptions = useMemo(
    () => [
      { id: NO_CATEGORY, label: s.common.noCategory },
      ...categories
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((category) => ({ id: String(category.id), label: category.name.en })),
    ],
    [categories, s.common.noCategory]
  );

  const badgeOptions = useMemo(
    () => [
      { id: NO_BADGE, label: s.products.badge.none },
      { id: "top", label: s.products.badge.top },
      { id: "new", label: s.products.badge.new },
    ],
    [s.products.badge]
  );

  const addOnItems = useMemo<PickerItem[]>(() => addOns.map((a) => ({ id: a.id, label: a.name.en })), [addOns]);

  // Barista's way can only use add-ons the product actually has.
  const baristaItems = useMemo<PickerItem[]>(() => {
    const chosen = new Set(input.addOnIds);
    return addOns.filter((a) => chosen.has(a.id)).map((a) => ({ id: a.id, label: a.name.en }));
  }, [addOns, input.addOnIds]);

  const hasText = (text: LocalizedText) => text.en.trim().length > 0 && text.ar.trim().length > 0;
  // A product that was saved without a photo still needs one before it can be saved again.
  const hasImage = initial?.image != null || pickedImage !== null;
  const isPricingValid = input.pricing.options.every((o) => o.discount <= o.price);
  // Every size of a multi-size product needs a name in both languages.
  const areSizeNamesValid =
    input.pricing.type === "single" || input.pricing.options.every((o) => o.name !== null && hasText(o.name));
  const isValid =
    hasText(input.name) && hasText(input.description) && hasImage && isPricingValid && areSizeNamesValid;

  const pickers: Record<
    PickerKey,
    { title: string; items: PickerItem[]; selected: number[]; search: string; empty: string }
  > = {
    addOns: {
      title: s.products.addOnsField.label,
      items: addOnItems,
      selected: input.addOnIds,
      search: s.products.addOnsField.searchPlaceholder,
      empty: s.products.addOnsField.empty,
    },
    barista: {
      title: s.products.baristaWay.label,
      items: baristaItems,
      selected: input.baristaWayAddOnIds,
      search: s.products.addOnsField.searchPlaceholder,
      empty: s.products.baristaWay.empty,
    },
    related: {
      title: s.products.related.label,
      items: otherProducts,
      selected: input.oftenOrderedWithIds,
      search: s.products.related.searchPlaceholder,
      empty: s.products.related.empty,
    },
  };

  const openPicker = (key: PickerKey) => {
    setDraftIds(pickers[key].selected);
    setPicker(key);
  };

  // Done writes the draft back. Removing an add-on also removes it from barista's way.
  const applyPicker = () => {
    if (picker === null) return;
    const ids = draftIds;
    setInput((i) => {
      if (picker === "addOns") {
        return { ...i, addOnIds: ids, baristaWayAddOnIds: i.baristaWayAddOnIds.filter((id) => ids.includes(id)) };
      }
      if (picker === "barista") return { ...i, baristaWayAddOnIds: ids };
      return { ...i, oftenOrderedWithIds: ids };
    });
    setPicker(null);
  };

  const removeAddOn = (id: number) =>
    setInput((i) => ({
      ...i,
      addOnIds: i.addOnIds.filter((x) => x !== id),
      baristaWayAddOnIds: i.baristaWayAddOnIds.filter((x) => x !== id),
    }));

  const submit = () => {
    if (picker !== null) {
      applyPicker();
      return;
    }
    if (isValid && !isSaving) onSave(input, pickedImage);
  };

  const active = picker === null ? null : pickers[picker];

  return (
    <MenuDialog
      isOpen={isOpen}
      isDismissable={!isSaving}
      size="lg"
      isTall={active !== null}
      contentKey={picker ?? "form"}
      title={active ? active.title : initial ? s.products.editTitle : s.products.addTitle}
      error={active ? undefined : error}
      onClose={onClose}
      onSubmit={submit}
      footer={
        active ? (
          <FormFooter
            isSaving={false}
            cancelLabel={s.products.picker.back}
            submitLabel={s.products.picker.done(draftIds.length)}
            onCancel={() => setPicker(null)}
          />
        ) : (
          <FormFooter isSaving={isSaving} isSubmitDisabled={!isValid} onCancel={onClose} />
        )
      }
    >
      {active ? (
        <PickerList
          items={active.items}
          selectedIds={draftIds}
          onChange={setDraftIds}
          searchPlaceholder={active.search}
          emptyLabel={active.empty}
        />
      ) : (
        // Two columns when the dialog is wide enough: what the product is on the left, how it
        // sells on the right. The three link lists are short summaries below, each opening a picker.
        <div className={STYLES.stack}>
          <section className={STYLES.section}>
          <h3 className={STYLES.sectionTitle}>{s.products.sections.details}</h3>
          <div className={STYLES.columns}>
            <div className={STYLES.column}>
              <ImageField
                label={s.products.image.label}
                previewUrl={previewUrl}
                isPending={pickedImage !== null}
                pendingLabel={s.products.image.pending}
                onSelect={setPickedImage}
                selectLabel={s.products.image.select}
                changeLabel={s.products.image.change}
                hint={hasImage ? undefined : s.products.imageRequired}
              />
              <LocalizedTextField
                label={s.products.name}
                value={input.name}
                onChange={(name) => setInput((i) => ({ ...i, name }))}
              />
              <LocalizedTextField
                label={s.products.productDescription}
                value={input.description}
                onChange={(description) => setInput((i) => ({ ...i, description }))}
                multiline
              />
            </div>

            <div className={STYLES.column}>
              <div className={STYLES.pairRow}>
                <SelectField
                  label={s.products.category}
                  value={input.categoryId === null ? NO_CATEGORY : String(input.categoryId)}
                  options={categoryOptions}
                  onChange={(value) =>
                    setInput((i) => ({ ...i, categoryId: value === NO_CATEGORY ? null : Number(value) }))
                  }
                />
                <SelectField
                  label={s.products.badge.label}
                  value={input.badge ?? NO_BADGE}
                  options={badgeOptions}
                  onChange={(value) =>
                    setInput((i) => ({ ...i, badge: value === NO_BADGE ? null : (value as MenuBadge) }))
                  }
                />
              </div>

              <ToggleField
                label={s.products.availability.label}
                hint={input.isAvailable ? s.products.availability.inStock : s.products.availability.outOfStock}
                isSelected={input.isAvailable}
                onChange={(isAvailable) => setInput((i) => ({ ...i, isAvailable }))}
              />

              <PricingEditor
                pricing={input.pricing}
                onChange={(pricing) => setInput((i) => ({ ...i, pricing }))}
                discountError={s.errors.MENU_DISCOUNT_INVALID}
              />
            </div>
          </div>

          </section>

          <section ref={listsRef} className={STYLES.section}>
          <h3 className={STYLES.sectionTitle}>{s.products.sections.extras}</h3>
          <div className={STYLES.lists}>
            <PickerSummaryField
              label={s.products.addOnsField.label}
              items={addOnItems}
              selectedIds={input.addOnIds}
              onRemove={removeAddOn}
              onOpen={() => openPicker("addOns")}
              emptyLabel={s.products.addOnsField.empty}
            />
            <PickerSummaryField
              label={s.products.baristaWay.label}
              items={baristaItems}
              selectedIds={input.baristaWayAddOnIds}
              onRemove={(id) => setInput((i) => ({ ...i, baristaWayAddOnIds: i.baristaWayAddOnIds.filter((x) => x !== id) }))}
              onOpen={() => openPicker("barista")}
              emptyLabel={s.products.baristaWay.empty}
            />
            <div className={STYLES.fullWidth}>
              <PickerSummaryField
                label={s.products.related.label}
                items={otherProducts}
                selectedIds={input.oftenOrderedWithIds}
                onRemove={(id) =>
                  setInput((i) => ({ ...i, oftenOrderedWithIds: i.oftenOrderedWithIds.filter((x) => x !== id) }))
                }
                onOpen={() => openPicker("related")}
                emptyLabel={s.products.related.empty}
              />
            </div>
          </div>
          </section>
        </div>
      )}
    </MenuDialog>
  );
}
