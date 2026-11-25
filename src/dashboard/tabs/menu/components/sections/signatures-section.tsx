import { useEffect, useState } from "react";
import { Button } from "react-aria-components";
import toast from "react-hot-toast";
import type { AdminMenuState } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { replaceSignatures } from "../../api/menu";
import { CONTROL_STYLES } from "../../control-styles";
import { useAdminMenuMutation } from "../../hooks/use-admin-menu";
import { getErrorMessage } from "../../lib/get-error-message";
import { strings } from "../../strings";
import { ChecklistField } from "../fields/checklist-field";

interface SignaturesSectionProps {
  menu: AdminMenuState;
}

const STYLES = {
  section: "flex flex-col gap-4",
  header: "flex flex-col gap-1",
  title: "text-heading font-bold text-navy",
  description: "text-small text-navy/70",
  footer: "flex items-center justify-between gap-3",
  count: "text-small font-bold text-navy/70",
  error: "text-small font-bold text-error",
} as const;

export function SignaturesSection({ menu }: SignaturesSectionProps) {
  const s = useStrings(strings);
  const [draft, setDraft] = useState<number[]>(menu.signatures);

  useEffect(() => {
    setDraft(menu.signatures);
  }, [menu.signatures]);

  const mutation = useAdminMenuMutation((ids: number[]) => replaceSignatures(ids));

  const items = menu.products.map((product) => ({
    id: product.id,
    label: product.name.en,
  }));

  const isDirty =
    draft.length !== menu.signatures.length ||
    draft.some((id, index) => id !== menu.signatures[index]);

  return (
    <section className={STYLES.section}>
      <div className={STYLES.header}>
        <h2 className={STYLES.title}>{s.signatures.title}</h2>
        <p className={STYLES.description}>{s.signatures.description}</p>
      </div>

      <ChecklistField
        label={s.signatures.title}
        items={items}
        selectedIds={draft}
        onChange={setDraft}
        searchPlaceholder={s.signatures.searchPlaceholder}
        emptyLabel={s.signatures.empty}
      />

      {mutation.error && (
        <p role="alert" className={STYLES.error}>
          {getErrorMessage(s.errors, mutation.error)}
        </p>
      )}

      <div className={STYLES.footer}>
        <span className={STYLES.count}>
          {s.signatures.selectedCount(draft.length)}
        </span>
        <Button
          isDisabled={!isDirty || mutation.isPending}
          onPress={() =>
            mutation.mutate(draft, {
              onSuccess: () => toast.success(s.common.saved),
            })
          }
          className={CONTROL_STYLES.buttonPrimary}
        >
          {mutation.isPending ? s.common.saving : s.signatures.save}
        </Button>
      </div>
    </section>
  );
}
