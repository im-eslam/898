import { useState } from "react";
import { Button } from "react-aria-components";
import type { AdminMenuState, AdminPairing, AdminPairingInput } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { createPairing, deletePairing, updatePairing } from "../../api/menu";
import { CONTROL_STYLES } from "../../control-styles";
import { useAdminMenuMutation } from "../../hooks/use-admin-menu";
import { getErrorMessage } from "../../lib/get-error-message";
import { strings } from "../../strings";
import { ConfirmDeleteDialog } from "../confirm-delete-dialog";
import { PairingFormDialog } from "./pairing-form-dialog";

interface PairingsSectionProps {
  menu: AdminMenuState;
}

const STYLES = {
  section: "flex flex-col gap-4",
  header: "flex items-center justify-between gap-3",
  title: "text-heading font-bold text-navy",
  description: "text-small text-navy/70",
  list: "flex flex-col gap-2",
  empty:
    "rounded-lg border border-dashed border-navy/20 p-6 text-center text-small text-navy/60",
  row: "flex items-center gap-3 rounded-lg border border-navy/10 bg-white p-3 shadow-card",
  names: "min-w-0 flex-1",
  pair: "truncate text-body font-bold text-navy",
  price: "text-small font-bold text-brand",
  actions: "flex shrink-0 items-center gap-1.5",
} as const;

export function PairingsSection({ menu }: PairingsSectionProps) {
  const s = useStrings(strings);
  const sorted = [...menu.pairings].sort((a, b) => a.position - b.position);
  const productName = (id: number) =>
    menu.products.find((p) => p.id === id)?.name.en ?? "?";
  const products = menu.products.map((p) => ({ id: p.id, label: p.name.en }));

  const [editing, setEditing] = useState<AdminPairing | "new" | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const createMutation = useAdminMenuMutation((input: AdminPairingInput) =>
    createPairing(input)
  );
  const updateMutation = useAdminMenuMutation(
    ({ id, input }: { id: number; input: AdminPairingInput }) =>
      updatePairing(id, input)
  );
  const deleteMutation = useAdminMenuMutation((id: number) => deletePairing(id));

  const saveMutation = editing === "new" ? createMutation : updateMutation;

  const closeForm = () => {
    setEditing(null);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleSubmit = (input: AdminPairingInput) => {
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
          <h2 className={STYLES.title}>{s.pairings.title}</h2>
          <p className={STYLES.description}>{s.pairings.description}</p>
        </div>
        <Button
          onPress={() => setEditing("new")}
          className={CONTROL_STYLES.buttonPrimary}
        >
          {s.pairings.add}
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className={STYLES.empty}>{s.pairings.empty}</p>
      ) : (
        <div className={STYLES.list}>
          {sorted.map((pairing) => (
            <div key={pairing.id} className={STYLES.row}>
              <div className={STYLES.names}>
                <p className={STYLES.pair}>
                  {productName(pairing.productIds[0]!)} +{" "}
                  {productName(pairing.productIds[1]!)}
                </p>
                <p className={STYLES.price}>
                  {pairing.price - pairing.discount} EGP
                </p>
              </div>
              <div className={STYLES.actions}>
                <Button
                  aria-label={s.common.edit}
                  onPress={() => setEditing(pairing)}
                  className={CONTROL_STYLES.iconButton}
                >
                  <Icon name="settings" size={17} />
                </Button>
                <Button
                  aria-label={s.common.delete}
                  isDisabled={deleteMutation.isPending && deletingId === pairing.id}
                  onPress={() => setDeletingId(pairing.id)}
                  className={CONTROL_STYLES.iconButtonDanger}
                >
                  <Icon name="trash" size={17} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PairingFormDialog
        key={editing === "new" ? "new" : editing?.id ?? "closed"}
        isOpen={editing !== null}
        initial={
          editing && editing !== "new"
            ? {
                productIds: editing.productIds,
                price: editing.price,
                discount: editing.discount,
              }
            : null
        }
        products={products}
        isSaving={saveMutation.isPending}
        error={saveMutation.error}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        isOpen={deletingId !== null}
        title={s.pairings.deleteTitle}
        text={s.pairings.deleteText}
        isDeleting={deleteMutation.isPending}
        error={
          deleteMutation.error
            ? getErrorMessage(s.errors, deleteMutation.error)
            : undefined
        }
        closeLabel={s.dialog.close}
        cancelLabel={s.confirm.cancel}
        confirmLabel={s.common.delete}
        deletingLabel={s.common.deleting}
        loadingLabel={s.confirm.loading}
        onCancel={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId !== null) {
            deleteMutation.mutate(deletingId, {
              onSuccess: () => setDeletingId(null),
            });
          }
        }}
      />
    </section>
  );
}
