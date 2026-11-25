import { useState } from "react";
import { Button } from "react-aria-components";
import type { AdminAddOn, AdminAddOnInput } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../../control-styles";
import {
  createAddOn,
  deleteAddOn,
  getAddOnUsage,
  reorderAddOns,
  updateAddOn,
} from "../../api/menu";
import { useAdminMenuMutation } from "../../hooks/use-admin-menu";
import { useDeleteFlow } from "../../hooks/use-delete-flow";
import { getErrorMessage } from "../../lib/get-error-message";
import { moveId } from "../../lib/reorder";
import { strings } from "../../strings";
import { ConfirmDeleteDialog } from "../confirm-delete-dialog";
import { ReorderRow } from "../reorder-row";
import { AddOnFormDialog } from "./add-on-form-dialog";

interface AddOnListProps {
  addOns: AdminAddOn[];
}

const STYLES = {
  section: "flex flex-col gap-4",
  header: "flex items-center justify-between gap-3",
  title: "text-heading font-bold text-navy",
  description: "text-small text-navy/70",
  list: "flex flex-col gap-2",
  empty:
    "rounded-lg border border-dashed border-navy/20 p-6 text-center text-small text-navy/60",
  row: "flex items-center justify-between gap-3",
  name: "text-body font-bold text-navy",
  price: "text-small font-bold text-brand",
} as const;

export function AddOnList({ addOns }: AddOnListProps) {
  const s = useStrings(strings);
  const sorted = [...addOns].sort((a, b) => a.position - b.position);
  const ids = sorted.map((a) => a.id);

  const [editing, setEditing] = useState<AdminAddOn | "new" | null>(null);

  const createMutation = useAdminMenuMutation((input: AdminAddOnInput) =>
    createAddOn(input)
  );
  const updateMutation = useAdminMenuMutation(
    ({ id, input }: { id: number; input: AdminAddOnInput }) =>
      updateAddOn(id, input)
  );
  const reorderMutation = useAdminMenuMutation((nextIds: number[]) =>
    reorderAddOns(nextIds)
  );
  const deleteFlow = useDeleteFlow({
    getUsage: getAddOnUsage,
    deleteItem: deleteAddOn,
  });

  const saveMutation = editing === "new" ? createMutation : updateMutation;

  const closeForm = () => {
    setEditing(null);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleSubmit = (input: AdminAddOnInput) => {
    if (editing === "new") {
      createMutation.mutate(input, { onSuccess: closeForm });
    } else if (editing) {
      updateMutation.mutate({ id: editing.id, input }, { onSuccess: closeForm });
    }
  };

  const warnings = deleteFlow.target
    ? [
        ...(deleteFlow.target.usage.products > 0
          ? [s.addOns.usage.products(deleteFlow.target.usage.products)]
          : []),
        ...(deleteFlow.target.usage.baristaWay > 0
          ? [s.addOns.usage.baristaWay(deleteFlow.target.usage.baristaWay)]
          : []),
      ]
    : [];

  return (
    <section className={STYLES.section}>
      <div className={STYLES.header}>
        <div>
          <h2 className={STYLES.title}>{s.addOns.title}</h2>
          <p className={STYLES.description}>{s.addOns.description}</p>
        </div>
        <Button
          onPress={() => setEditing("new")}
          className={CONTROL_STYLES.buttonPrimary}
        >
          {s.addOns.add}
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className={STYLES.empty}>{s.addOns.empty}</p>
      ) : (
        <div className={STYLES.list}>
          {sorted.map((addOn, index) => (
            <ReorderRow
              key={addOn.id}
              canMoveUp={index > 0}
              canMoveDown={index < sorted.length - 1}
              onMoveUp={() => reorderMutation.mutate(moveId(ids, index, -1))}
              onMoveDown={() => reorderMutation.mutate(moveId(ids, index, 1))}
              onEdit={() => setEditing(addOn)}
              onDelete={() => void deleteFlow.request(addOn.id)}
              moveUpLabel={s.common.moveUp}
              moveDownLabel={s.common.moveDown}
              editLabel={s.common.edit}
              deleteLabel={s.common.delete}
              isDeleting={
                deleteFlow.isDeleting && deleteFlow.target?.id === addOn.id
              }
            >
              <div className={STYLES.row}>
                <span className={STYLES.name}>{addOn.name.en}</span>
                <span className={STYLES.price}>{addOn.price} EGP</span>
              </div>
            </ReorderRow>
          ))}
        </div>
      )}

      <AddOnFormDialog
        isOpen={editing !== null}
        initial={
          editing && editing !== "new"
            ? { name: editing.name, price: editing.price }
            : null
        }
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
        title={s.addOns.deleteTitle}
        text={s.addOns.deleteText}
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
