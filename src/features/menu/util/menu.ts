import type {
  MenuAddOnDto,
  MenuAvailability,
  MenuBadge,
  MenuDto,
  MenuPairingDto,
  MenuPriceOptionDto,
  MenuProductDto,
} from "@api/contracts";

export class Stock {
  static isAvailable(item: { availability: MenuAvailability }): boolean {
    return item.availability === "in_stock";
  }

  static badgeFor(product: MenuProductDto): MenuBadge | "outOfStock" | null {
    return Stock.isAvailable(product) ? product.badge : "outOfStock";
  }
}

export class MenuLookup {
  static product(menu: MenuDto, id: number): MenuProductDto | undefined {
    for (const category of menu.categories) {
      const product = category.products.find((p) => p.id === id);
      if (product) return product;
    }
    return undefined;
  }

  static defaultOption(
    product: MenuProductDto
  ): MenuPriceOptionDto | undefined {
    return product.pricing.options[0];
  }

  static defaultOptionId(product: MenuProductDto): number | null {
    return MenuLookup.defaultOption(product)?.id ?? null;
  }

  static option(
    product: MenuProductDto,
    optionId: number | null
  ): MenuPriceOptionDto | undefined {
    const options = product.pricing.options;
    return options.find((o) => o.id === optionId) ?? options[0];
  }

  static lines(source: MenuProductDto | MenuPairingDto): MenuProductDto[] {
    return "items" in source ? source.items : [source];
  }
}

export class Pricing {
  static addOns(product: MenuProductDto, addOnIds: readonly number[]): number {
    const known: MenuAddOnDto[] = [...product.addOns, ...product.baristaWay];
    return [...new Set(addOnIds)].reduce(
      (sum, id) => sum + (known.find((a) => a.id === id)?.price ?? 0),
      0
    );
  }

  static product(
    product: MenuProductDto,
    optionId: number | null,
    addOnIds: readonly number[]
  ): number {
    const option = MenuLookup.option(product, optionId);
    return (option?.final ?? 0) + Pricing.addOns(product, addOnIds);
  }

  static pairing(
    pairing: MenuPairingDto,
    optionIds: readonly (number | null)[],
    addOnIds: readonly (readonly number[])[]
  ): number {
    const upgrades = pairing.items.reduce((sum, product, index) => {
      const base = MenuLookup.defaultOption(product)?.final ?? 0;
      const chosen =
        MenuLookup.option(product, optionIds[index] ?? null)?.final ?? base;
      return sum + (chosen - base);
    }, 0);

    const extras = pairing.items.reduce(
      (sum, product, index) =>
        sum + Pricing.addOns(product, addOnIds[index] ?? []),
      0
    );

    return pairing.pricing.final + upgrades + extras;
  }
}

export class Selection {
  static withBarista(
    addOnIds: readonly number[],
    baristaIds: readonly number[],
    on: boolean
  ): number[] {
    return [
      ...addOnIds.filter((id) => !baristaIds.includes(id)),
      ...(on ? baristaIds : []),
    ];
  }

  static withAddOns(
    addOnIds: readonly number[],
    groupIds: readonly number[],
    picked: readonly number[]
  ): number[] {
    return [...addOnIds.filter((id) => !groupIds.includes(id)), ...picked];
  }
}
