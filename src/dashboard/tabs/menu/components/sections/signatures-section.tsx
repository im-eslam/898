import { useMemo, useState } from "react";
import type { AdminMenuState } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { replaceSignatures } from "../../api/menu";
import { LIST } from "../../control-styles";
import { useAdminMenuMutation } from "../../hooks/use-admin-menu";
import { useDialog } from "../../hooks/use-dialog";
import { useReorder } from "../../hooks/use-reorder";
import { productImageUrl } from "../../lib/image-url";
import { strings } from "../../strings";
import { ConfirmDeleteDialog } from "../confirm-delete-dialog";
import { ListToolbar } from "../list-toolbar";
import { ReorderRow } from "../reorder-row";
import { SignaturePickerDialog, type SignaturePickerOption } from "./signature-picker-dialog";

interface SignaturesSectionProps {
  menu: AdminMenuState;
}

const STYLES = {
  thumb: `${LIST.thumb} text-navy/40`,
  image: "size-full object-cover",
  name: LIST.title,
  meta: LIST.meta,
} as const;

// Same row as the Products list. The order here is the order guests see.
export function SignaturesSection({ menu }: SignaturesSectionProps) {
  const s = useStrings(strings);
  const picker = useDialog();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const productById = useMemo(() => new Map(menu.products.map((p) => [p.id, p] as const)), [menu.products]);
  const categoryNameById = useMemo(
    () => new Map(menu.categories.map((c) => [c.id, c.name.en] as const)),
    [menu.categories]
  );
  const categoryName = (categoryId: number | null) =>
    (categoryId === null ? undefined : categoryNameById.get(categoryId)) ?? s.common.noCategory;

  const saveMutation = useAdminMenuMutation((productIds: number[]) => replaceSignatures(productIds));
  const reorder = useReorder(menu.signatures, (productIds) => saveMutation.mutateAsync(productIds));

  const featured = useMemo(
    () =>
      reorder.order.flatMap((id) => {
        const product = productById.get(id);
        return product ? [product] : [];
      }),
    [reorder.order, productById]
  );

  // Built once per change instead of scanning the signature list for every product.
  const candidates = useMemo<SignaturePickerOption[]>(() => {
    const featuredIds = new Set(reorder.order);
    const noCategory = s.common.noCategory;
    return menu.products
      .filter((p) => !featuredIds.has(p.id))
      .map((p) => ({
        id: p.id,
        label: p.name.en,
        searchText: `${p.name.en} ${p.name.ar}`.toLowerCase(),
        meta: (p.categoryId === null ? undefined : categoryNameById.get(p.categoryId)) ?? noCategory,
        imageUrl: p.image ? productImageUrl(p.image) : null,
      }));
  }, [menu.products, reorder.order, categoryNameById, s.common.noCategory]);

  // Adds and removes queue through the same save line as moves, so they never race.
  const addSignatures = (ids: number[]) => {
    reorder.replace([...reorder.order, ...ids]);
    picker.close();
  };

  const confirmRemove = () => {
    if (removingId !== null) reorder.replace(reorder.order.filter((id) => id !== removingId));
    setRemovingId(null);
  };

  return (
    <section className="flex flex-col gap-4">
      <ListToolbar
        count={s.signatures.count(featured.length)}
        actionLabel={s.signatures.add}
        onAction={() => picker.open()}
      />

      {featured.length === 0 ? (
        <p className={LIST.empty}>{s.signatures.empty}</p>
      ) : (
        <div className={LIST.stack}>
          {featured.map((product, index) => {
            const image = product.image ? productImageUrl(product.image) : null;
            return (
              <ReorderRow
                key={product.id}
                itemName={product.name.en}
                canMoveUp={index > 0}
                canMoveDown={index < featured.length - 1}
                onMoveUp={() => reorder.move(product.id, -1)}
                onMoveDown={() => reorder.move(product.id, 1)}
                onDelete={() => setRemovingId(product.id)}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className={STYLES.thumb}>
                    {image ? (
                      <img src={image} alt="" loading="lazy" decoding="async" className={STYLES.image} />
                    ) : (
                      <Icon name="cup" size={22} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={STYLES.name}>{product.name.en}</span>
                    <span className={STYLES.meta}>{categoryName(product.categoryId)}</span>
                  </div>
                </div>
              </ReorderRow>
            );
          })}
        </div>
      )}

      <ConfirmDeleteDialog
        isOpen={removingId !== null}
        title={s.signatures.removeTitle}
        text={s.signatures.removeText}
        confirmLabel={s.signatures.remove}
        isDeleting={false}
        onCancel={() => setRemovingId(null)}
        onConfirm={confirmRemove}
      />

      <SignaturePickerDialog
        key={picker.session}
        isOpen={picker.isOpen}
        options={candidates}
        onClose={picker.close}
        onConfirm={addSignatures}
      />
    </section>
  );
}
