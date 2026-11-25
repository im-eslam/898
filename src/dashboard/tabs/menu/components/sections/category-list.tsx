import { useState } from "react";
import { Button } from "react-aria-components";
import type { AdminCategory, AdminCategoryInput } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../../control-styles";
import {
  createCategory,
  deleteCategory,
  getCategoryUsage,
  reorderCategories,
  updateCategory,
} from "../../api/menu";
import { useAdminMenuMutation } from "../../hooks/use-admin-menu";
import { useDeleteFlow } from "../../hooks/use-delete-flow";
import { getErrorMessage } from "../../lib/get-error-message";
import { moveId } from "../../lib/reorder";
import { strings } from "../../strings";
import { ConfirmDeleteDialog } from "../confirm-delete-dialog";
import { ReorderRow } from "../reorder-row";
import { CategoryFormDialog } from "./category-form-dialog";

interface CategoryListProps {
  categories: AdminCategory[];
}

const STYLES = {
  section: "flex flex-col gap-4",
  header: "flex items-center justify-between gap-3",
  title: "text-heading font-bold text-navy",
  description: "text-small text-navy/70",
  list: "flex flex-col gap-2",
  empty:
    "rounded-lg border border-dashed border-navy/20 p-6 text-center text-small text-navy/60",
  name: "text-body font-bold text-navy",
} as const;

export function CategoryList({ categories }: CategoryListProps) {
  const s = useStrings(strings);
  const sorted = [...categories].sort((a, b) => a.position - b.position);
  const ids = sorted.map((c) => c.id);

  const [editing, setEditing] = useState<AdminCategory | "new" | null>(null);

  const createMutation = useAdminMenuMutation((input: AdminCategoryInput) =>
    createCategory(input)
  );
  const updateMutation = useAdminMenuMutation(
    ({ id, input }: { id: number; input: AdminCategoryInput }) =>
      updateCategory(id, input)
  );
  const reorderMutation = useAdminMenuMutation((nextIds: number[]) =>
    reorderCategories(nextIds)
  );
  const deleteFlow = useDeleteFlow({
    getUsage: getCategoryUsage,
    deleteItem: deleteCategory,
  });

  const saveMutation = editing === "new" ? createMutation : updateMutation;

  const closeForm = () => {
    setEditing(null);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleSubmit = (input: AdminCategoryInput) => {
    if (editing === "new") {
      createMutation.mutate(input, { onSuccess: closeForm });
    } else if (editing) {
      updateMutation.mutate({ id: editing.id, input }, { onSuccess: closeForm });
    }
  };

  return (
    <section className={STYLES.section}>
      <div className={STYLES.header}>
        <div>
          <h2 className={STYLES.title}>{s.categories.title}</h2>
          <p className={STYLES.description}>{s.categories.description}</p>
        </div>
        <Button
          onPress={() => setEditing("new")}
          className={CONTROL_STYLES.buttonPrimary}
        >
          {s.categories.add}
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className={STYLES.empty}>{s.categories.empty}</p>
      ) : (
        <div className={STYLES.list}>
          {sorted.map((category, index) => (
            <ReorderRow
              key={category.id}
              canMoveUp={index > 0}
              canMoveDown={index < sorted.length - 1}
              onMoveUp={() =>
                reorderMutation.mutate(moveId(ids, index, -1))
              }
              onMoveDown={() =>
                reorderMutation.mutate(moveId(ids, index, 1))
              }
              onEdit={() => setEditing(category)}
              onDelete={() => void deleteFlow.request(category.id)}
              moveUpLabel={s.common.moveUp}
              moveDownLabel={s.common.moveDown}
              editLabel={s.common.edit}
              deleteLabel={s.common.delete}
              isDeleting={
                deleteFlow.isDeleting && deleteFlow.target?.id === category.id
              }
            >
              <span className={STYLES.name}>{category.name.en}</span>
            </ReorderRow>
          ))}
        </div>
      )}

      <CategoryFormDialog
        isOpen={editing !== null}
        initial={editing && editing !== "new" ? { name: editing.name } : null}
        isSaving={saveMutation.isPending}
        error={saveMutation.error}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        isOpen={
          deleteFlow.target !== null ||
          deleteFlow.isLoadingUsage ||
          deleteFlow.usageError !== null
        }
        title={s.categories.deleteTitle}
        text={s.categories.deleteText}
        warnings={
          deleteFlow.target && deleteFlow.target.usage.products > 0
            ? [s.categories.usage.products(deleteFlow.target.usage.products)]
            : []
        }
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
