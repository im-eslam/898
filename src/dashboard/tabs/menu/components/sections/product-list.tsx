import { useMemo } from "react";
import type { AdminAddOn, AdminCategory, AdminProduct, AdminProductInput } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import {
  createProduct,
  deleteProduct,
  getProductUsage,
  reorderProducts,
  replaceProductImage,
  updateProduct,
} from "../../api/menu";
import { useAdminMenuMutation } from "../../hooks/use-admin-menu";
import { useDeleteFlow } from "../../hooks/use-delete-flow";
import { useDialog } from "../../hooks/use-dialog";
import { useReorder } from "../../hooks/use-reorder";
import { errorText } from "../../lib/get-error-message";
import { productImageUrl } from "../../lib/image-url";
import { strings } from "../../strings";
import { ConfirmDeleteDialog } from "../confirm-delete-dialog";
import { LIST } from "../../control-styles";
import { ListToolbar } from "../list-toolbar";
import { ReorderRow } from "../reorder-row";
import { ProductFormDialog } from "./product-form-dialog";

interface ProductListProps {
  products: AdminProduct[];
  categories: AdminCategory[];
  addOns: AdminAddOn[];
  selectedCategoryId: number | null;
}

type SaveVars =
  | { mode: "create"; input: AdminProductInput; image: File }
  | { mode: "update"; id: number; input: AdminProductInput; image: File | null };

// Creating needs an image. Updating only replaces the image if a new one was picked.
async function saveProduct(vars: SaveVars) {
  if (vars.mode === "create") return createProduct(vars.input, vars.image);
  if (vars.image) await replaceProductImage(vars.id, vars.image);
  return updateProduct(vars.id, vars.input);
}

function lowestFinalPrice(product: AdminProduct): number {
  const prices = product.pricing.options.map((o) => o.price - o.discount);
  return prices.length > 0 ? Math.min(...prices) : 0;
}

const STYLES = {
  name: LIST.title,
  meta: LIST.meta,
} as const;

// The list for one category. The parent gives it a key per category, so its save queue
// never sends one category's order to another.
export function ProductList({ products, categories, addOns, selectedCategoryId }: ProductListProps) {
  const s = useStrings(strings);

  const inCategory = useMemo(
    () => products.filter((p) => p.categoryId === selectedCategoryId).sort((a, b) => a.position - b.position),
    [products, selectedCategoryId]
  );
  const serverIds = useMemo(() => inCategory.map((p) => p.id), [inCategory]);
  const byId = useMemo(() => new Map(inCategory.map((product) => [product.id, product] as const)), [inCategory]);

  const dialog = useDialog<AdminProduct>();
  const editingId = dialog.target?.id;

  const saveMutation = useAdminMenuMutation(saveProduct);
  const reorderMutation = useAdminMenuMutation(
    (productIds: number[]) => reorderProducts(selectedCategoryId, productIds),
    "orderSaved"
  );
  const reorder = useReorder(serverIds, (productIds) => reorderMutation.mutateAsync(productIds));
  const deleteFlow = useDeleteFlow({ getUsage: getProductUsage, deleteItem: deleteProduct });

  const closeForm = () => {
    dialog.close();
    saveMutation.reset();
  };

  const handleSave = (input: AdminProductInput, image: File | null) => {
    const editing = dialog.target;
    if (editing) {
      saveMutation.mutate({ mode: "update", id: editing.id, input, image }, { onSuccess: closeForm });
    } else if (image) {
      saveMutation.mutate({ mode: "create", input, image }, { onSuccess: closeForm });
    }
  };

  const otherProducts = useMemo(
    () => products.filter((p) => p.id !== editingId).map((p) => ({ id: p.id, label: p.name.en })),
    [products, editingId]
  );

  const usage = deleteFlow.target?.usage;
  const warnings = usage
    ? [
        ...(usage.signatures > 0 ? [s.products.usage.signatures(usage.signatures)] : []),
        ...(usage.pairings > 0 ? [s.products.usage.pairings(usage.pairings)] : []),
        ...(usage.relatedFrom > 0 ? [s.products.usage.relatedFrom(usage.relatedFrom)] : []),
      ]
    : [];

  const ordered = useMemo(
    () => reorder.order.flatMap((id) => {
      const product = byId.get(id);
      return product ? [product] : [];
    }),
    [reorder.order, byId]
  );

  return (
    <section className="flex flex-col gap-4">
      <ListToolbar actionLabel={s.products.add} onAction={() => dialog.open()} />

      {ordered.length === 0 ? (
        <p className={LIST.empty}>{s.products.empty}</p>
      ) : (
        <div className={LIST.stack}>
          {ordered.map((product, index) => {
            const image = product.image ? productImageUrl(product.image) : null;
            const price = lowestFinalPrice(product);
            return (
              <ReorderRow
                key={product.id}
                itemName={product.name.en}
                canMoveUp={index > 0}
                canMoveDown={index < ordered.length - 1}
                onMoveUp={() => reorder.move(product.id, -1)}
                onMoveDown={() => reorder.move(product.id, 1)}
                onEdit={() => dialog.open(product)}
                onDelete={() => void deleteFlow.request(product.id)}
                isBusy={deleteFlow.isDeleting}
                isDeleting={deleteFlow.isDeleting && deleteFlow.target?.id === product.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className={LIST.thumb}>
                    {image && <img src={image} alt="" loading="lazy" decoding="async" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={STYLES.name}>{product.name.en}</span>
                    <span className={STYLES.meta}>
                      {product.pricing.type === "multiple" ? s.products.priceFrom(price) : `${price} EGP`}
                      {" · "}
                      {product.isAvailable ? s.products.availability.inStock : s.products.availability.outOfStock}
                    </span>
                  </div>
                </div>
              </ReorderRow>
            );
          })}
        </div>
      )}

      <ProductFormDialog
        key={dialog.session}
        isOpen={dialog.isOpen}
        initial={dialog.target ?? null}
        defaultCategoryId={selectedCategoryId}
        categories={categories}
        addOns={addOns}
        otherProducts={otherProducts}
        isSaving={saveMutation.isPending}
        error={errorText(s.errors, saveMutation.error)}
        onClose={closeForm}
        onSave={handleSave}
      />

      <ConfirmDeleteDialog
        isOpen={deleteFlow.target !== null || deleteFlow.isLoadingUsage || deleteFlow.usageError !== null}
        title={s.products.deleteTitle}
        text={s.products.deleteText}
        warnings={warnings}
        isLoading={deleteFlow.isLoadingUsage}
        isDeleting={deleteFlow.isDeleting}
        canConfirm={deleteFlow.target !== null}
        error={errorText(s.errors, deleteFlow.usageError ?? deleteFlow.deleteError)}
        onCancel={deleteFlow.cancel}
        onConfirm={deleteFlow.confirm}
      />
    </section>
  );
}
