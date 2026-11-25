import { useMemo, useState } from "react";
import { Button } from "react-aria-components";
import type { AdminMenuState, AdminPairing, AdminPairingInput } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { createPairing, deletePairing, updatePairing } from "../../api/menu";
import { CONTROL_STYLES, LIST } from "../../control-styles";
import { useAdminMenuMutation } from "../../hooks/use-admin-menu";
import { useDialog } from "../../hooks/use-dialog";
import { errorText } from "../../lib/get-error-message";
import { strings } from "../../strings";
import { ConfirmDeleteDialog } from "../confirm-delete-dialog";
import { ListToolbar } from "../list-toolbar";
import { PairingFormDialog } from "./pairing-form-dialog";

interface PairingsSectionProps {
  menu: AdminMenuState;
}

const STYLES = {
  row: "flex items-center gap-3 rounded-lg border border-navy/10 bg-white p-3",
  info: "flex min-w-0 flex-1 flex-col gap-1",
  pair: "truncate text-body font-bold text-navy",
  priceRow: "flex flex-wrap items-center gap-x-2 gap-y-1",
  finalPrice: "text-body font-bold text-brand tabular-nums",
  oldPrice: "text-small text-navy/70 line-through tabular-nums",
  saveBadge: "rounded-full bg-brand/10 px-2 py-0.5 text-caption font-bold text-brand",
  actions: "flex shrink-0 items-center gap-1.5",
} as const;

export function PairingsSection({ menu }: PairingsSectionProps) {
  const s = useStrings(strings);

  const sorted = useMemo(() => [...menu.pairings].sort((a, b) => a.position - b.position), [menu.pairings]);
  const productById = useMemo(() => new Map(menu.products.map((p) => [p.id, p] as const)), [menu.products]);
  const productOptions = useMemo(
    () => menu.products.map((p) => ({ id: String(p.id), label: p.name.en })),
    [menu.products]
  );
  const nameOf = (id: number | undefined) => {
    const product = id === undefined ? undefined : productById.get(id);
    return product ? product.name.en : s.pairings.missingProduct;
  };

  const dialog = useDialog<AdminPairing>();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const saveMutation = useAdminMenuMutation(({ id, input }: { id: number | null; input: AdminPairingInput }) =>
    id === null ? createPairing(input) : updatePairing(id, input)
  );
  const deleteMutation = useAdminMenuMutation((id: number) => deletePairing(id), "deleted");

  const closeForm = () => {
    dialog.close();
    saveMutation.reset();
  };

  const closeDelete = () => {
    setDeletingId(null);
    deleteMutation.reset();
  };

  return (
    <section className="flex flex-col gap-4">
      <ListToolbar actionLabel={s.pairings.add} onAction={() => dialog.open()} />

      {sorted.length === 0 ? (
        <p className={LIST.empty}>{s.pairings.empty}</p>
      ) : (
        <div className={LIST.stack}>
          {sorted.map((pairing) => {
            const [first, second] = pairing.productIds;
            const finalPrice = pairing.price - pairing.discount;
            return (
              <div key={pairing.id} className={STYLES.row}>
                <div className={STYLES.info}>
                  <p className={STYLES.pair}>
                    {nameOf(first)} + {nameOf(second)}
                  </p>
                  <div className={STYLES.priceRow}>
                    <span className={STYLES.finalPrice}>{finalPrice} EGP</span>
                    {pairing.discount > 0 && (
                      <>
                        <span className={STYLES.oldPrice}>{pairing.price} EGP</span>
                        <span className={STYLES.saveBadge}>{s.pairings.saves(pairing.discount)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className={STYLES.actions}>
                  <Button
                    aria-label={`${s.common.edit}: ${nameOf(first)} + ${nameOf(second)}`}
                    onPress={() => dialog.open(pairing)}
                    className={CONTROL_STYLES.iconButton}
                  >
                    <Icon name="settings" size={17} />
                  </Button>
                  <Button
                    aria-label={`${s.common.delete}: ${nameOf(first)} + ${nameOf(second)}`}
                    onPress={() => setDeletingId(pairing.id)}
                    className={CONTROL_STYLES.iconButtonDanger}
                  >
                    <Icon name="trash" size={17} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PairingFormDialog
        key={dialog.session}
        isOpen={dialog.isOpen}
        initial={dialog.target ?? null}
        products={productOptions}
        isSaving={saveMutation.isPending}
        error={errorText(s.errors, saveMutation.error)}
        onClose={closeForm}
        onSave={(input) => saveMutation.mutate({ id: dialog.target?.id ?? null, input }, { onSuccess: closeForm })}
      />

      <ConfirmDeleteDialog
        isOpen={deletingId !== null}
        title={s.pairings.deleteTitle}
        text={s.pairings.deleteText}
        isDeleting={deleteMutation.isPending}
        error={errorText(s.errors, deleteMutation.error)}
        onCancel={closeDelete}
        onConfirm={() => {
          if (deletingId === null) return;
          deleteMutation.mutate(deletingId, { onSuccess: closeDelete });
        }}
      />
    </section>
  );
}
