import { useEffect, useMemo, useState } from "react";
import { Button, Form } from "react-aria-components";
import type {
  AdminAddOn,
  AdminCategory,
  AdminProduct,
  AdminProductInput,
  LocalizedText,
  MenuBadge,
} from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../../control-styles";
import { getErrorMessage } from "../../lib/get-error-message";
import { productImageUrl } from "../../lib/image-url";
import { strings } from "../../strings";
import { ChecklistField } from "../fields/checklist-field";
import { ImageField } from "../fields/image-field";
import { LocalizedTextField } from "../fields/localized-text-field";
import { SelectField } from "../fields/select-field";
import { ToggleField } from "../fields/toggle-field";
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

function toInput(product: AdminProduct): AdminProductInput {
  return {
    categoryId: product.categoryId,
    name: product.name,
    description: product.description,
    isAvailable: product.isAvailable,
    badge: product.badge,
    pricing: product.pricing,
    addOnIds: product.addOnIds,
    baristaWayAddOnIds: product.baristaWayAddOnIds,
    oftenOrderedWithIds: product.oftenOrderedWithIds,
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
  saveError: unknown;
  onClose: () => void;
  onCreate: (input: AdminProductInput, image: File) => void;
  onUpdate: (input: AdminProductInput) => void;
  onReplaceImage: (file: File) => void;
  isReplacingImage: boolean;
  replaceImageError: unknown;
}

export function ProductFormDialog({
  isOpen,
  initial,
  defaultCategoryId,
  categories,
  addOns,
  otherProducts,
  isSaving,
  saveError,
  onClose,
  onCreate,
  onUpdate,
  onReplaceImage,
  isReplacingImage,
  replaceImageError,
}: ProductFormDialogProps) {
  const s = useStrings(strings);
  const [input, setInput] = useState<AdminProductInput>(
    initial ? toInput(initial) : defaultInput(defaultCategoryId)
  );
  const [pickedImage, setPickedImage] = useState<File | null>(null);
  const [pickedImageUrl, setPickedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!pickedImage) {
      setPickedImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(pickedImage);
    setPickedImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pickedImage]);

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

  const badgeOptions = [
    { id: NO_BADGE, label: s.products.badge.none },
    { id: "top", label: s.products.badge.top },
    { id: "new", label: s.products.badge.new },
  ];

  const addOnItems = addOns.map((a) => ({ id: a.id, label: a.name.en }));
  const baristaItems = addOns
    .filter((a) => input.addOnIds.includes(a.id))
    .map((a) => ({ id: a.id, label: a.name.en }));

  const isNameValid =
    input.name.en.trim().length > 0 && input.name.ar.trim().length > 0;
  const isDescriptionValid =
    input.description.en.trim().length > 0 &&
    input.description.ar.trim().length > 0;
  const hasImage = Boolean(initial) || pickedImage !== null;
  const isValid = isNameValid && isDescriptionValid && hasImage;

  const existingImageUrl = initial ? productImageUrl(initial.image) : null;

  const handleSubmit = () => {
    if (!isValid) return;
    if (initial) {
      onUpdate(input);
    } else if (pickedImage) {
      onCreate(input, pickedImage);
    }
  };

  return (
    <MenuDialog
      isOpen={isOpen}
      isDismissable={!isSaving}
      size="lg"
      title={initial ? s.products.editTitle : s.products.addTitle}
      closeLabel={s.dialog.close}
      onClose={onClose}
    >
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
        className="flex flex-col gap-5"
      >
        {initial ? (
          <ImageField
            label={s.products.image.label}
            previewUrl={existingImageUrl}
            onSelect={onReplaceImage}
            selectLabel={s.products.image.select}
            changeLabel={
              isReplacingImage ? s.common.saving : s.products.image.change
            }
            hint={s.products.image.hint}
            error={
              replaceImageError !== null && replaceImageError !== undefined
                ? getErrorMessage(s.errors, replaceImageError)
                : undefined
            }
          />
        ) : (
          <ImageField
            label={s.products.image.label}
            previewUrl={pickedImageUrl}
            onSelect={setPickedImage}
            selectLabel={s.products.image.select}
            changeLabel={s.products.image.change}
            hint={s.products.image.hint}
          />
        )}

        <LocalizedTextField
          label={s.products.name}
          value={input.name}
          onChange={(name) => setInput((i) => ({ ...i, name }))}
          enLabel={s.common.nameEn}
          arLabel={s.common.nameAr}
        />

        <LocalizedTextField
          label={s.products.productDescription}
          value={input.description}
          onChange={(description) => setInput((i) => ({ ...i, description }))}
          enLabel={s.common.nameEn}
          arLabel={s.common.nameAr}
          multiline
        />

        <SelectField
          label={s.products.category}
          value={input.categoryId === null ? NO_CATEGORY : String(input.categoryId)}
          options={categoryOptions}
          onChange={(value) =>
            setInput((i) => ({
              ...i,
              categoryId: value === NO_CATEGORY ? null : Number(value),
            }))
          }
        />

        <ToggleField
          label={s.products.availability.label}
          hint={
            input.isAvailable
              ? s.products.availability.inStock
              : s.products.availability.outOfStock
          }
          isSelected={input.isAvailable}
          onChange={(isAvailable) => setInput((i) => ({ ...i, isAvailable }))}
        />

        <SelectField
          label={s.products.badge.label}
          value={input.badge ?? NO_BADGE}
          options={badgeOptions}
          onChange={(value) =>
            setInput((i) => ({
              ...i,
              badge: value === NO_BADGE ? null : (value as MenuBadge),
            }))
          }
        />

        <PricingEditor
          pricing={input.pricing}
          onChange={(pricing) => setInput((i) => ({ ...i, pricing }))}
        />

        <ChecklistField
          label={s.products.addOnsField.label}
          items={addOnItems}
          selectedIds={input.addOnIds}
          onChange={(addOnIds) =>
            setInput((i) => ({
              ...i,
              addOnIds,
              baristaWayAddOnIds: i.baristaWayAddOnIds.filter((id) =>
                addOnIds.includes(id)
              ),
            }))
          }
          searchPlaceholder={s.products.addOnsField.searchPlaceholder}
          emptyLabel={s.products.addOnsField.empty}
        />

        <ChecklistField
          label={s.products.baristaWay.label}
          items={baristaItems}
          selectedIds={input.baristaWayAddOnIds}
          onChange={(baristaWayAddOnIds) =>
            setInput((i) => ({ ...i, baristaWayAddOnIds }))
          }
          emptyLabel={
            baristaItems.length === 0
              ? s.products.baristaWay.empty
              : s.products.addOnsField.empty
          }
        />
        {input.addOnIds.length === 0 && (
          <p className="-mt-3 text-caption text-navy/60">
            {s.products.baristaWay.hint}
          </p>
        )}

        <ChecklistField
          label={s.products.related.label}
          items={otherProducts}
          selectedIds={input.oftenOrderedWithIds}
          onChange={(oftenOrderedWithIds) =>
            setInput((i) => ({ ...i, oftenOrderedWithIds }))
          }
          searchPlaceholder={s.products.related.searchPlaceholder}
          emptyLabel={s.products.related.empty}
        />

        {!hasImage && (
          <p className="text-small font-bold text-error">
            {s.products.imageRequired}
          </p>
        )}

        {saveError !== null && saveError !== undefined && (
          <p role="alert" className="text-small font-bold text-error">
            {getErrorMessage(s.errors, saveError)}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            isDisabled={isSaving}
            onPress={onClose}
            className={CONTROL_STYLES.button}
          >
            {s.common.cancel}
          </Button>
          <Button
            type="submit"
            isDisabled={isSaving || !isValid}
            className={CONTROL_STYLES.buttonPrimary}
          >
            {isSaving ? s.common.saving : s.common.save}
          </Button>
        </div>
      </Form>
    </MenuDialog>
  );
}
