import { useState } from "react";
import { Button } from "react-aria-components";
import type {
  AdminAddOn,
  AdminCategory,
  AdminProduct,
  AdminProductInput,
} from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../../control-styles";
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
import { getErrorMessage } from "../../lib/get-error-message";
import { productImageUrl } from "../../lib/image-url";
import { moveId } from "../../lib/reorder";
import { strings } from "../../strings";
import { ConfirmDeleteDialog } from "../confirm-delete-dialog";
import { ReorderRow } from "../reorder-row";
import { ProductFormDialog } from "./product-form-dialog";

interface ProductListProps {
  products: AdminProduct[];
  categories: AdminCategory[];
  addOns: AdminAddOn[];
  selectedCategoryId: number | null;
}

const STYLES = {
  section: "flex flex-col gap-4",
  header: "flex items-center justify-between gap-3",
  title: "text-heading font-bold text-navy",
  description: "text-small text-navy/70",
  list: "flex flex-col gap-2",
  empty:
    "rounded-lg border border-dashed border-navy/20 p-6 text-center text-small text-navy/60",
  row: "flex items-center gap-3",
  thumb:
    "size-12 shrink-0 overflow-hidden rounded-md border border-navy/10 bg-cream",
  image: "size-full object-cover",
  info: "min-w-0 flex-1",
  name: "truncate text-body font-bold text-navy",
  meta: "truncate text-caption text-navy/60",
} as const;

export function ProductList({
  products,
  categories,
  addOns,
  selectedCategoryId,
}: ProductListProps) {
  const s = useStrings(strings);
  const inCategory = products
    .filter((p) => p.categoryId === selectedCategoryId)
    .sort((a, b) => a.position - b.position);
  const ids = inCategory.map((p) => p.id);

  const [editing, setEditing] = useState<AdminProduct | "new" | null>(null);

  const createMutation = useAdminMenuMutation(
    ({ input, image }: { input: AdminProductInput; image: File }) =>
      createProduct(input, image)
  );
  const updateMutation = useAdminMenuMutation(
    ({ id, input }: { id: number; input: AdminProductInput }) =>
      updateProduct(id, input)
  );
  const imageMutation = useAdminMenuMutation(
    ({ id, image }: { id: number; image: File }) => replaceProductImage(id, image)
  );
  const reorderMutation = useAdminMenuMutation(
    ({ categoryId, productIds }: { categoryId: number | null; productIds: number[] }) =>
      reorderProducts(categoryId, productIds)
  );
  const deleteFlow = useDeleteFlow({
    getUsage: getProductUsage,
    deleteItem: deleteProduct,
  });

  const closeForm = () => {
    setEditing(null);
    createMutation.reset();
    updateMutation.reset();
    imageMutation.reset();
  };

  const otherProducts = products
    .filter((p) => (editing && editing !== "new" ? p.id !== editing.id : true))
    .map((p) => ({ id: p.id, label: p.name.en }));

  const editingProduct = editing && editing !== "new" ? editing : null;

  const warnings = deleteFlow.target
    ? [
        ...(deleteFlow.target.usage.signatures > 0
          ? [s.products.usage.signatures(deleteFlow.target.usage.signatures)]
          : []),
        ...(deleteFlow.target.usage.pairings > 0
          ? [s.products.usage.pairings(deleteFlow.target.usage.pairings)]
          : []),
        ...(deleteFlow.target.usage.relatedFrom > 0
          ? [s.products.usage.relatedFrom(deleteFlow.target.usage.relatedFrom)]
          : []),
      ]
    : [];

  return (
    <section className={STYLES.section}>
      <div className={STYLES.header}>
        <div>
          <h2 className={STYLES.title}>{s.products.title}</h2>
          <p className={STYLES.description}>{s.products.description}</p>
        </div>
        <Button
          onPress={() => setEditing("new")}
          className={CONTROL_STYLES.buttonPrimary}
        >
          {s.products.add}
        </Button>
      </div>

      {inCategory.length === 0 ? (
        <p className={STYLES.empty}>{s.products.empty}</p>
      ) : (
        <div className={STYLES.list}>
          {inCategory.map((product, index) => (
            <ReorderRow
              key={product.id}
              canMoveUp={index > 0}
              canMoveDown={index < inCategory.length - 1}
              onMoveUp={() =>
                reorderMutation.mutate({
                  categoryId: selectedCategoryId,
                  productIds: moveId(ids, index, -1),
                })
              }
              onMoveDown={() =>
                reorderMutation.mutate({
                  categoryId: selectedCategoryId,
                  productIds: moveId(ids, index, 1),
                })
              }
              onEdit={() => setEditing(product)}
              onDelete={() => void deleteFlow.request(product.id)}
              moveUpLabel={s.common.moveUp}
              moveDownLabel={s.common.moveDown}
              editLabel={s.common.edit}
              deleteLabel={s.common.delete}
              isDeleting={
                deleteFlow.isDeleting && deleteFlow.target?.id === product.id
              }
            >
              <div className={STYLES.row}>
                <div className={STYLES.thumb}>
                  <img
                    src={productImageUrl(product.image) || "/placeholder.svg"}
                    alt=""
                    className={STYLES.image}
                  />
                </div>
                <div className={STYLES.info}>
                  <p className={STYLES.name}>{product.name.en}</p>
                  <p className={STYLES.meta}>
                    {product.isAvailable
                      ? s.products.availability.inStock
                      : s.products.availability.outOfStock}
                  </p>
                </div>
              </div>
            </ReorderRow>
          ))}
        </div>
      )}

      <ProductFormDialog
        key={editingProduct?.id ?? (editing === "new" ? "new" : "closed")}
        isOpen={editing !== null}
        initial={editingProduct}
        defaultCategoryId={selectedCategoryId}
        categories={categories}
        addOns={addOns}
        otherProducts={otherProducts}
        isSaving={createMutation.isPending || updateMutation.isPending}
        saveError={createMutation.error || updateMutation.error}
        onClose={closeForm}
        onCreate={(input, image) =>
          createMutation.mutate({ input, image }, { onSuccess: closeForm })
        }
        onUpdate={(input) => {
          if (editingProduct) {
            updateMutation.mutate(
              { id: editingProduct.id, input },
              { onSuccess: closeForm }
            );
          }
        }}
        onReplaceImage={(image) => {
          if (editingProduct) {
            imageMutation.mutate({ id: editingProduct.id, image });
          }
        }}
        isReplacingImage={imageMutation.isPending}
        replaceImageError={imageMutation.error}
      />

      <ConfirmDeleteDialog
        isOpen={
          deleteFlow.target !== null ||
          deleteFlow.isLoadingUsage ||
          deleteFlow.usageError !== null
        }
        title={s.products.deleteTitle}
        text={s.products.deleteText}
        warnings={warnings}
        isLoading={deleteFlow.isLoadingUsage}
        isDeleting={deleteFlow.isDeleting}
        error={
          deleteFlow.usageError || deleteFlow.deleteError
            ? getErrorMessage(
                s.errors,
                deleteFlow.usageError ?? deleteFlow.deleteError
              )
            : undefined
        }
        closeLabel={s.dialog.close}
        cancelLabel={s.confirm.cancel}
        confirmLabel={s.common.delete}
        deletingLabel={s.common.deleting}
        loadingLabel={s.confirm.loading}
        onCancel={deleteFlow.cancel}
        onConfirm={deleteFlow.confirm}
      />
    </section>
  );
}
