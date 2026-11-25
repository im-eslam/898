import { useMemo } from "react";
import type { AdminAddOn, AdminAddOnInput } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { createAddOn, deleteAddOn, getAddOnUsage, reorderAddOns, updateAddOn } from "../../api/menu";
import { LIST } from "../../control-styles";
import { useAdminMenuMutation } from "../../hooks/use-admin-menu";
import { useDialog } from "../../hooks/use-dialog";
import { useDeleteFlow } from "../../hooks/use-delete-flow";
import { useReorder } from "../../hooks/use-reorder";
import { errorText } from "../../lib/get-error-message";
import { strings } from "../../strings";
import { ConfirmDeleteDialog } from "../confirm-delete-dialog";
import { ListToolbar } from "../list-toolbar";
import { ReorderRow } from "../reorder-row";
import { AddOnFormDialog } from "./add-on-form-dialog";

interface AddOnListProps {
  addOns: AdminAddOn[];
}

const STYLES = {
  name: "min-w-0 flex-1 truncate text-body font-bold text-navy",
  price: "shrink-0 text-small font-bold text-brand tabular-nums",
} as const;

export function AddOnList({ addOns }: AddOnListProps) {
  const s = useStrings(strings);
  const sorted = useMemo(() => [...addOns].sort((a, b) => a.position - b.position), [addOns]);
  const byId = useMemo(() => new Map(sorted.map((addOn) => [addOn.id, addOn] as const)), [sorted]);
  const serverIds = useMemo(() => sorted.map((a) => a.id), [sorted]);

  const dialog = useDialog<AdminAddOn>();

  const saveMutation = useAdminMenuMutation(
    ({ id, input }: { id: number | null; input: AdminAddOnInput }) =>
      id === null ? createAddOn(input) : updateAddOn(id, input)
  );
  const reorderMutation = useAdminMenuMutation((ids: number[]) => reorderAddOns(ids), "orderSaved");
  const reorder = useReorder(serverIds, (ids) => reorderMutation.mutateAsync(ids));
  const deleteFlow = useDeleteFlow({ getUsage: getAddOnUsage, deleteItem: deleteAddOn });

  const closeForm = () => {
    dialog.close();
    saveMutation.reset();
  };

  const warnings = deleteFlow.target
    ? [
        ...(deleteFlow.target.usage.products > 0 ? [s.addOns.usage.products(deleteFlow.target.usage.products)] : []),
        ...(deleteFlow.target.usage.baristaWay > 0
          ? [s.addOns.usage.baristaWay(deleteFlow.target.usage.baristaWay)]
          : []),
      ]
    : [];

  const ordered = useMemo(
    () =>
      reorder.order.flatMap((id) => {
        const addOn = byId.get(id);
        return addOn ? [addOn] : [];
      }),
    [reorder.order, byId]
  );

  return (
    <section className="flex flex-col gap-4">
      <ListToolbar actionLabel={s.addOns.add} onAction={() => dialog.open()} />

      {ordered.length === 0 ? (
        <p className={LIST.empty}>{s.addOns.empty}</p>
      ) : (
        <div className={LIST.stack}>
          {ordered.map((addOn, index) => (
            <ReorderRow
              key={addOn.id}
              itemName={addOn.name.en}
              canMoveUp={index > 0}
              canMoveDown={index < ordered.length - 1}
              onMoveUp={() => reorder.move(addOn.id, -1)}
              onMoveDown={() => reorder.move(addOn.id, 1)}
              onEdit={() => dialog.open(addOn)}
              onDelete={() => void deleteFlow.request(addOn.id)}
              isBusy={deleteFlow.isDeleting}
              isDeleting={deleteFlow.isDeleting && deleteFlow.target?.id === addOn.id}
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <span className={STYLES.name}>{addOn.name.en}</span>
                <span className={STYLES.price}>{addOn.price} EGP</span>
              </div>
            </ReorderRow>
          ))}
        </div>
      )}

      <AddOnFormDialog
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
        title={s.addOns.deleteTitle}
        text={s.addOns.deleteText}
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
