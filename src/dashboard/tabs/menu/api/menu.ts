import type {
  AddOnUsage,
  AdminAddOnInput,
  AdminCategoryInput,
  AdminMenuState,
  AdminPairingInput,
  AdminPopupInput,
  AdminProductInput,
  CategoryUsage,
  MenuCreated,
  MenuDeleted,
  MenuOk,
  ProductUsage,
} from "@api/contracts";
import { deleteJson, getJson, sendForm, sendJson } from "./client";

const BASE = "/api/admin/menu";

export function getAdminMenu(): Promise<AdminMenuState & { ok: true }> {
  return getJson(BASE);
}

export function updatePopup(input: AdminPopupInput): Promise<MenuOk> {
  return sendJson("PUT", `${BASE}/popup`, input);
}

export function replacePopupImage(image: File): Promise<MenuOk> {
  const form = new FormData();
  form.set("image", image);
  return sendForm("PUT", `${BASE}/popup/image`, form);
}

export function replaceSignatures(productIds: number[]): Promise<MenuOk> {
  return sendJson("PUT", `${BASE}/signatures`, { productIds });
}

export function createPairing(input: AdminPairingInput): Promise<MenuCreated> {
  return sendJson("POST", `${BASE}/pairings`, input);
}

export function updatePairing(
  id: number,
  input: AdminPairingInput
): Promise<MenuOk> {
  return sendJson("PUT", `${BASE}/pairings/${id}`, input);
}

export function deletePairing(id: number): Promise<MenuDeleted> {
  return deleteJson(`${BASE}/pairings/${id}`);
}

export function createAddOn(input: AdminAddOnInput): Promise<MenuCreated> {
  return sendJson("POST", `${BASE}/add-ons`, input);
}

export function updateAddOn(
  id: number,
  input: AdminAddOnInput
): Promise<MenuOk> {
  return sendJson("PUT", `${BASE}/add-ons/${id}`, input);
}

export function deleteAddOn(id: number): Promise<MenuDeleted> {
  return deleteJson(`${BASE}/add-ons/${id}`);
}

export function reorderAddOns(ids: number[]): Promise<MenuOk> {
  return sendJson("PUT", `${BASE}/add-ons/order`, { ids });
}

export function getAddOnUsage(
  id: number
): Promise<{ ok: true; usage: AddOnUsage }> {
  return getJson(`${BASE}/add-ons/${id}/usage`);
}

export function createCategory(
  input: AdminCategoryInput
): Promise<MenuCreated> {
  return sendJson("POST", `${BASE}/categories`, input);
}

export function updateCategory(
  id: number,
  input: AdminCategoryInput
): Promise<MenuOk> {
  return sendJson("PUT", `${BASE}/categories/${id}`, input);
}

export function deleteCategory(id: number): Promise<MenuDeleted> {
  return deleteJson(`${BASE}/categories/${id}`);
}

export function reorderCategories(ids: number[]): Promise<MenuOk> {
  return sendJson("PUT", `${BASE}/categories/order`, { ids });
}

export function getCategoryUsage(
  id: number
): Promise<{ ok: true; usage: CategoryUsage }> {
  return getJson(`${BASE}/categories/${id}/usage`);
}

export function createProduct(
  input: AdminProductInput,
  image: File
): Promise<MenuCreated> {
  const form = new FormData();
  form.set("data", JSON.stringify(input));
  form.set("image", image);
  return sendForm("POST", `${BASE}/products`, form);
}

export function updateProduct(
  id: number,
  input: AdminProductInput
): Promise<MenuOk> {
  return sendJson("PUT", `${BASE}/products/${id}`, input);
}

export function replaceProductImage(id: number, image: File): Promise<MenuOk> {
  const form = new FormData();
  form.set("image", image);
  return sendForm("PUT", `${BASE}/products/${id}/image`, form);
}

export function deleteProduct(id: number): Promise<MenuDeleted> {
  return deleteJson(`${BASE}/products/${id}`);
}

export function reorderProducts(
  categoryId: number | null,
  productIds: number[]
): Promise<MenuOk> {
  return sendJson("PUT", `${BASE}/products/order`, { categoryId, productIds });
}

export function getProductUsage(
  id: number
): Promise<{ ok: true; usage: ProductUsage }> {
  return getJson(`${BASE}/products/${id}/usage`);
}
