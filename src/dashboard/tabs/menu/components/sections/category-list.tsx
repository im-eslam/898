import { useMemo } from "react";
import type { AdminCategory, AdminCategoryInput, AdminProduct } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { createCategory, deleteCategory, getCategoryUsage, reorderCategories, updateCategory } from "../../api/menu";
import { ConfirmDeleteDialog } from "../confirm-delete-dialog";
import { LIST } from "../../control-styles";
import { useAdminMenuMutation } from "../../hooks/use-admin-menu";
import { useDialog } from "../../hooks/use-dialog";
import { useDeleteFlow } from "../../hooks/use-delete-flow";
import { useReorder } from "../../hooks/use-reorder";
import { errorText } from "../../lib/get-error-message";
import { strings } from "../../strings";
import { ListToolbar } from "../list-toolbar";
import { ReorderRow } from "../reorder-row";
import { CategoryFormDialog } from "./category-form-dialog";

interface CategoryListProps {
  categories: AdminCategory[];
  products: AdminProduct[];
}

const STYLES = {
  name: LIST.title,
  meta: "block text-caption text-navy/70",
} as const;

export function CategoryList({ categories, products }: CategoryListProps) {
  const s = useStrings(strings);
  const sorted = useMemo(() => [...categories].sort((a, b) => a.position - b.position), [categories]);
  const byId = useMemo(() => new Map(sorted.map((category) => [category.id, category] as const)), [sorted]);

  // Product counts for every category in one pass, instead of a filter per row.
  const countById = useMemo(() => {
    const counts = new Map<number, number>();
    for (const product of products) {
      if (product.categoryId !== null) counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const dialog = useDialog<AdminCategory>();

  const saveMutation = useAdminMenuMutation(
    ({ id, input }: { id: number | null; input: AdminCategoryInput }) =>
      id === null ? createCategory(input) : updateCategory(id, input)
  );
  const reorderMutation = useAdminMenuMutation((ids: number[]) => reorderCategories(ids), "orderSaved");
  const serverIds = useMemo(() => sorted.map((c) => c.id), [sorted]);
  const reorder = useReorder(serverIds, (ids) => reorderMutation.mutateAsync(ids));
  const deleteFlow = useDeleteFlow({ getUsage: getCategoryUsage, deleteItem: deleteCategory });

  const closeForm = () => {
    dialog.close();
    saveMutation.reset();
  };

  const ordered = useMemo(
    () =>
      reorder.order.flatMap((id) => {
        const category = byId.get(id);
        return category ? [category] : [];
      }),
    [reorder.order, byId]
  );

  return (
    <section className="flex flex-col gap-4">
      <ListToolbar actionLabel={s.categories.add} onAction={() => dialog.open()} />

      {ordered.length === 0 ? (
        <p className={LIST.empty}>{s.categories.empty}</p>
      ) : (
        <div className={LIST.stack}>
          {ordered.map((category, index) => (
            <ReorderRow
              key={category.id}
              itemName={category.name.en}
              canMoveUp={index > 0}
              canMoveDown={index < ordered.length - 1}
              onMoveUp={() => reorder.move(category.id, -1)}
              onMoveDown={() => reorder.move(category.id, 1)}
              onEdit={() => dialog.open(category)}
              onDelete={() => void deleteFlow.request(category.id)}
              isBusy={deleteFlow.isDeleting}
              isDeleting={deleteFlow.isDeleting && deleteFlow.target?.id === category.id}
            >
              <span className={STYLES.name}>{category.name.en}</span>
              <span className={STYLES.meta}>{s.common.productCount(countById.get(category.id) ?? 0)}</span>
            </ReorderRow>
          ))}
        </div>
      )}

      <CategoryFormDialog
        key={dialog.session}
        isOpen={dialog.isOpen}
        initial={dialog.target ?? null}
        isSaving={saveMutation.isPending}
        error={errorText(s.errors, saveMutation.error)}
        onClose={closeForm}
        onSave={(input) => saveMutation.mutate({ id: dialog.target?.id ?? null, input }, { onSuccess: closeForm })}
      />

      <ConfirmDeleteDialog
        isOpen={deleteFlow.target !== null || deleteFlow.isLoadingUsage || deleteFlow.usageError !== null}
        title={s.categories.deleteTitle}
        text={s.categories.deleteText}
        warnings={
          deleteFlow.target && deleteFlow.target.usage.products > 0
            ? [s.categories.usage.products(deleteFlow.target.usage.products)]
            : []
        }
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
