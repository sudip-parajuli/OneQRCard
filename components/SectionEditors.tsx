"use client";

import { useState, useEffect } from "react";
import { MenuItem, MenuCategory, MenuSectionData, GallerySectionData, ServiceItem, ServicesSectionData } from "@/lib/sections";
import { nanoid } from "nanoid";

// Compress images client-side before converting to base64
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// Keyboard-driven list navigation helper
function handleInputKeyDown(
  e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  itemId: string,
  elementPrefix: string,
  onLastAction: () => void
) {
  if (e.key === "Enter") {
    if (e.currentTarget.tagName.toLowerCase() === "textarea") {
      return;
    }
    e.preventDefault();
    const parent = document.getElementById(`${elementPrefix}-${itemId}`);
    if (!parent) return;

    // Find all text/tel/email/url inputs inside this item (exclude checkbox and file inputs)
    const inputs = Array.from(
      parent.querySelectorAll('input:not([type="checkbox"]):not([type="file"])')
    ) as HTMLInputElement[];

    const currentIndex = inputs.indexOf(e.currentTarget as HTMLInputElement);
    if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus();
    } else {
      onLastAction();
    }
  }
}

// 1. Menu Editor Component
interface MenuEditorProps {
  data: MenuSectionData;
  onChange: (newData: MenuSectionData) => void;
  brandColor: string;
}

export function MenuEditor({ data, onChange, brandColor }: MenuEditorProps) {
  const [newCatName, setNewCatName] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string>(
    data.categories?.[0]?.id || ""
  );
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const categories = data.categories || [];
  const showPrices = data.show_prices !== false;
  const orderCta = data.order_cta || "none";

  useEffect(() => {
    if (justAddedId) {
      const el = document.getElementById(`menu-item-${justAddedId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const input = el.querySelector("input");
        if (input) input.focus();
        setJustAddedId(null);
      }
    }
  }, [justAddedId]);

  function updateCategories(updated: MenuCategory[]) {
    onChange({
      ...data,
      categories: updated,
      show_prices: showPrices,
      order_cta: orderCta,
    });
  }

  function addCategory() {
    if (!newCatName.trim()) return;
    const newCat: MenuCategory = {
      id: nanoid(6),
      name: newCatName.trim(),
      items: [],
    };
    const nextCats = [...categories, newCat];
    updateCategories(nextCats);
    setSelectedCatId(newCat.id);
    setNewCatName("");
  }

  function deleteCategory(catId: string) {
    const nextCats = categories.filter((c) => c.id !== catId);
    updateCategories(nextCats);
    if (selectedCatId === catId && nextCats.length > 0) {
      setSelectedCatId(nextCats[0].id);
    }
  }

  function addItem(catId: string) {
    const newId = nanoid(6);
    const nextCats = categories.map((cat) => {
      if (cat.id !== catId) return cat;
      const newItem: MenuItem = {
        id: newId,
        name: "New Menu Item",
        price: "Rs. 0",
        description: "",
        is_popular: false,
        is_sold_out: false,
      };
      return {
        ...cat,
        items: [...cat.items, newItem],
      };
    });
    updateCategories(nextCats);
    setJustAddedId(newId);
  }

  function updateItem(catId: string, itemId: string, field: keyof MenuItem, value: any) {
    const nextCats = categories.map((cat) => {
      if (cat.id !== catId) return cat;
      const nextItems = cat.items.map((item) => {
        if (item.id !== itemId) return item;
        return { ...item, [field]: value };
      });
      return { ...cat, items: nextItems };
    });
    updateCategories(nextCats);
  }

  async function handleItemPhotoUpload(catId: string, itemId: string, file: File) {
    try {
      const base64 = await compressImage(file);
      updateItem(catId, itemId, "photo_data_url", base64);
    } catch (err) {
      console.error("Photo compression failed:", err);
    }
  }

  function deleteItem(catId: string, itemId: string) {
    const nextCats = categories.map((cat) => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.filter((item) => item.id !== itemId),
      };
    });
    updateCategories(nextCats);
  }

  const activeCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  return (
    <div className="space-y-6">
      {/* Global Config Toggles */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-stone-50 p-4 rounded-xl border border-stone-200/60 text-xs">
        <label className="flex items-center gap-2 font-medium text-stone-700 cursor-pointer">
          <input
            type="checkbox"
            checked={showPrices}
            onChange={(e) => onChange({ ...data, show_prices: e.target.checked })}
            className="rounded border-stone-300 text-brand focus:ring-brand"
          />
          Show Prices on Menu
        </label>
        
        <div className="flex items-center gap-2">
          <span className="font-medium text-stone-700">Order CTA Link:</span>
          <select
            value={orderCta}
            onChange={(e) => onChange({ ...data, order_cta: e.target.value as any })}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs outline-none"
          >
            <option value="none">No Action</option>
            <option value="call">Call to Order</option>
            <option value="whatsapp">WhatsApp Message</option>
          </select>
        </div>
      </div>

      {/* Sticky Categories & Active Category Add-Item Header */}
      <div className="sticky top-0 bg-white z-20 py-3.5 border-b border-stone-200 -mx-4 px-4 space-y-4 shadow-sm">
        {/* Categories Tabs Editor */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Categories</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${
                  (activeCategory?.id === cat.id)
                    ? "bg-brand text-white border-brand shadow-sm"
                    : "bg-white hover:bg-stone-50 text-stone-600 border-stone-200"
                }`}
                onClick={() => setSelectedCatId(cat.id)}
              >
                <span>{cat.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCategory(cat.id);
                  }}
                  className={`text-[9px] font-bold hover:scale-110 p-0.5 rounded-full ${
                    activeCategory?.id === cat.id
                      ? "text-white/80 hover:text-white"
                      : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Inline Add Category input */}
            <div className="flex items-center gap-1 border border-stone-200 bg-white rounded-full px-2.5 py-1 text-xs">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New Category..."
                className="outline-none text-xs w-24 bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCategory();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCategory}
                className="text-brand font-bold text-base leading-none"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {activeCategory && (
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-stone-900">
              Items in <span className="text-brand">{activeCategory.name}</span>
            </h4>
            <button
              type="button"
              onClick={() => addItem(activeCategory.id)}
              className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              + Add Item
            </button>
          </div>
        )}
      </div>

      {/* Items List inside Active Category */}
      {activeCategory ? (
        <div className="space-y-4">
          <div className="space-y-3">
            {activeCategory.items.length === 0 ? (
              <p className="text-stone-400 text-xs text-center py-6">
                No items added. Click "+ Add Item" above.
              </p>
            ) : (
              activeCategory.items.map((item, idx) => {
                const isLastItem = idx === activeCategory.items.length - 1;
                const onLastAction = isLastItem
                  ? () => addItem(activeCategory.id)
                  : () => {
                      const nextId = activeCategory.items[idx + 1].id;
                      setTimeout(() => {
                        const nextEl = document.getElementById(`menu-item-${nextId}`);
                        const input = nextEl?.querySelector('input:not([type="checkbox"]):not([type="file"])') as HTMLInputElement;
                        input?.focus();
                      }, 0);
                    };

                return (
                  <div
                    key={item.id}
                    id={`menu-item-${item.id}`}
                    className="bg-stone-50/50 hover:bg-stone-50 border border-stone-200/80 p-4 rounded-xl grid gap-4 relative group scroll-mt-20"
                  >
                    <button
                      type="button"
                      onClick={() => deleteItem(activeCategory.id, item.id)}
                      className="absolute top-3 right-3 text-stone-400 hover:text-red-500 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Remove Item
                    </button>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Item Name */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Item Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(activeCategory.id, item.id, "name", e.target.value)}
                          className="input text-xs h-9 bg-white"
                          placeholder="e.g. Margarita Pizza"
                          onKeyDown={(e) => handleInputKeyDown(e, item.id, "menu-item", onLastAction)}
                        />
                      </div>
                      {/* Item Price */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Price</label>
                        <input
                          type="text"
                          value={item.price}
                          onChange={(e) => updateItem(activeCategory.id, item.id, "price", e.target.value)}
                          className="input text-xs h-9 bg-white"
                          placeholder="e.g. Rs. 450"
                          onKeyDown={(e) => handleInputKeyDown(e, item.id, "menu-item", onLastAction)}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Description (Optional)</label>
                      <textarea
                        rows={1.5}
                        value={item.description || ""}
                        onChange={(e) => updateItem(activeCategory.id, item.id, "description", e.target.value)}
                        className="input text-xs py-2 bg-white resize-none"
                        placeholder="e.g. Fresh tomatoes, mozzarella, basil and olive oil"
                      />
                    </div>

                    <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center">
                      {/* Flags */}
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-xs text-stone-600 font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!item.is_popular}
                            onChange={(e) => updateItem(activeCategory.id, item.id, "is_popular", e.target.checked)}
                            className="rounded border-stone-300 text-brand focus:ring-brand"
                          />
                          ⭐ Popular Item
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-stone-600 font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!item.is_sold_out}
                            onChange={(e) => updateItem(activeCategory.id, item.id, "is_sold_out", e.target.checked)}
                            className="rounded border-stone-300 text-brand focus:ring-brand"
                          />
                          🚫 Sold Out
                        </label>
                      </div>

                      {/* Image Upload */}
                      <div className="flex items-center gap-2">
                        {item.photo_data_url && (
                          <img
                            src={item.photo_data_url}
                            alt={item.name}
                            className="w-8 h-8 rounded object-cover border border-stone-200"
                          />
                        )}
                        <label className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 text-[10px] font-bold px-2 py-1.5 rounded-lg cursor-pointer transition-all">
                          {item.photo_data_url ? "Change Photo" : "Upload Photo"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleItemPhotoUpload(activeCategory.id, item.id, file);
                            }}
                          />
                        </label>
                        {item.photo_data_url && (
                          <button
                            type="button"
                            onClick={() => updateItem(activeCategory.id, item.id, "photo_data_url", undefined)}
                            className="text-stone-400 hover:text-stone-600 text-xs p-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {activeCategory.items.length > 0 && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => addItem(activeCategory.id)}
                className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                + Add Item
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-stone-400 text-xs text-center py-6">
          Please add a category to configure menu items.
        </p>
      )}
    </div>
  );
}

// 2. Gallery Editor Component
interface GalleryEditorProps {
  data: GallerySectionData;
  onChange: (newData: GallerySectionData) => void;
  brandColor: string;
}

export function GalleryEditor({ data, onChange, brandColor }: GalleryEditorProps) {
  const images = data.images || [];
  const layout = data.layout || "grid";
  const [uploading, setUploading] = useState(false);

  function updateImages(updated: GallerySectionData["images"]) {
    onChange({ ...data, images: updated, layout });
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const nextImages = [...images];

    const availableSlots = 12 - nextImages.length;
    const processCount = Math.min(files.length, availableSlots);

    for (let i = 0; i < processCount; i++) {
      try {
        const compressed = await compressImage(files[i]);
        nextImages.push({
          id: nanoid(6),
          data_url: compressed,
          caption: "",
        });
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }

    updateImages(nextImages);
    setUploading(false);
  }

  function updateCaption(imgId: string, val: string) {
    const nextImages = images.map((img) =>
      img.id === imgId ? { ...img, caption: val } : img
    );
    updateImages(nextImages);
  }

  function deleteImage(imgId: string) {
    const nextImages = images.filter((img) => img.id !== imgId);
    updateImages(nextImages);
  }

  return (
    <div className="space-y-6">
      {/* Layout Option */}
      <div className="flex items-center justify-between bg-stone-50 p-4 rounded-xl border border-stone-200/60 text-xs">
        <span className="font-semibold text-stone-700">Display Layout:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...data, layout: "grid" })}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              layout === "grid"
                ? "bg-brand text-white border-brand shadow-sm"
                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
            }`}
          >
            Grid Layout
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...data, layout: "strip" })}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              layout === "strip"
                ? "bg-brand text-white border-brand shadow-sm"
                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
            }`}
          >
            Horizontal Strip
          </button>
        </div>
      </div>

      {/* Image Grid Listing */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-stone-100 pb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Images ({images.length} / 12)
          </h4>
          
          {images.length < 12 && (
            <label className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5">
              {uploading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-brand" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                "+ Add Images"
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handlePhotoUpload}
              />
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl flex flex-col gap-2 relative group"
            >
              <button
                type="button"
                onClick={() => deleteImage(img.id)}
                className="absolute top-2 right-2 bg-stone-900/60 hover:bg-stone-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer transition-colors"
              >
                ✕
              </button>

              <img
                src={img.data_url}
                alt="Uploaded portfolio item"
                className="w-full h-24 object-cover rounded-lg border border-stone-200"
              />

              <input
                type="text"
                value={img.caption || ""}
                onChange={(e) => updateCaption(img.id, e.target.value)}
                placeholder="Caption (optional)"
                className="w-full text-[10px] border-b border-stone-200 outline-none pb-1 bg-transparent text-stone-700"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. Services Editor Component
interface ServicesEditorProps {
  data: ServicesSectionData;
  onChange: (newData: ServicesSectionData) => void;
  brandColor: string;
}

export function ServicesEditor({ data, onChange, brandColor }: ServicesEditorProps) {
  const services = data.services || [];
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (justAddedId) {
      const el = document.getElementById(`service-item-${justAddedId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const input = el.querySelector("input");
        if (input) input.focus();
        setJustAddedId(null);
      }
    }
  }, [justAddedId]);

  function updateServices(updated: ServiceItem[]) {
    onChange({ ...data, services: updated });
  }

  function addService() {
    const newId = nanoid(6);
    const newService: ServiceItem = {
      id: newId,
      name: "New Service Offered",
      price: "",
      duration: "",
      description: "",
      is_popular: false,
      booking_url: "",
    };
    updateServices([...services, newService]);
    setJustAddedId(newId);
  }

  function updateService(serviceId: string, field: keyof ServiceItem, value: any) {
    const nextServices = services.map((srv) =>
      srv.id === serviceId ? { ...srv, [field]: value } : srv
    );
    updateServices(nextServices);
  }

  function deleteService(serviceId: string) {
    const nextServices = services.filter((srv) => srv.id !== serviceId);
    updateServices(nextServices);
  }

  return (
    <div className="space-y-6">
      {/* Sticky Services Header */}
      <div className="sticky top-0 bg-white z-20 py-3.5 border-b border-stone-200 -mx-4 px-4 flex justify-between items-center shadow-sm">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Services list
        </h4>
        <button
          type="button"
          onClick={addService}
          className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          + Add Service
        </button>
      </div>

      <div className="space-y-4">
        {services.length === 0 ? (
          <p className="text-stone-400 text-xs text-center py-6">
            No services configured. Click "+ Add Service" above.
          </p>
        ) : (
          services.map((srv, idx) => {
            const isLastItem = idx === services.length - 1;
            const onLastAction = isLastItem
              ? () => addService()
              : () => {
                  const nextId = services[idx + 1].id;
                  setTimeout(() => {
                    const nextEl = document.getElementById(`service-item-${nextId}`);
                    const input = nextEl?.querySelector('input:not([type="checkbox"]):not([type="file"])') as HTMLInputElement;
                    input?.focus();
                  }, 0);
                };

            return (
              <div
                key={srv.id}
                id={`service-item-${srv.id}`}
                className="bg-stone-50/50 hover:bg-stone-50 border border-stone-200/80 p-4 rounded-xl grid gap-3.5 relative group animate-fade-in scroll-mt-20"
              >
                <button
                  type="button"
                  onClick={() => deleteService(srv.id)}
                  className="absolute top-3 right-3 text-stone-400 hover:text-red-500 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Remove
                </button>

                {/* Service Name */}
                <div className="flex flex-col gap-1 pr-14">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Service Name</label>
                  <input
                    type="text"
                    value={srv.name}
                    onChange={(e) => updateService(srv.id, "name", e.target.value)}
                    className="input text-xs h-9 bg-white"
                    placeholder="e.g. Haircut & Style"
                    onKeyDown={(e) => handleInputKeyDown(e, srv.id, "service-item", onLastAction)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Duration */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Duration (Optional)</label>
                    <input
                      type="text"
                      value={srv.duration || ""}
                      onChange={(e) => updateService(srv.id, "duration", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. 45 mins"
                      onKeyDown={(e) => handleInputKeyDown(e, srv.id, "service-item", onLastAction)}
                    />
                  </div>
                  {/* Price */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Price (Optional)</label>
                    <input
                      type="text"
                      value={srv.price || ""}
                      onChange={(e) => updateService(srv.id, "price", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. Rs. 800"
                      onKeyDown={(e) => handleInputKeyDown(e, srv.id, "service-item", onLastAction)}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={srv.description || ""}
                    onChange={(e) => updateService(srv.id, "description", e.target.value)}
                    className="input text-xs py-2 bg-white resize-none"
                    placeholder="e.g. Complete washing, trimming, styling and premium hair serum treatment."
                  />
                </div>

                <div className="grid sm:grid-cols-[1fr_200px] gap-4 items-center">
                  {/* Booking link */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Custom Booking URL (Optional)</label>
                    <input
                      type="text"
                      value={srv.booking_url || ""}
                      onChange={(e) => updateService(srv.id, "booking_url", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. https://calendly.com/..."
                      onKeyDown={(e) => handleInputKeyDown(e, srv.id, "service-item", onLastAction)}
                    />
                  </div>

                  {/* Popularity toggle */}
                  <label className="flex items-center gap-1.5 text-xs text-stone-600 font-medium cursor-pointer self-end py-2">
                    <input
                      type="checkbox"
                      checked={!!srv.is_popular}
                      onChange={(e) => updateService(srv.id, "is_popular", e.target.checked)}
                      className="rounded border-stone-300 text-brand focus:ring-brand"
                    />
                    ⭐ Feature as Popular
                  </label>
                </div>
              </div>
            );
          })
        )}
      </div>

      {services.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={addService}
            className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            + Add Service
          </button>
        </div>
      )}
    </div>
  );
}

// 4. Hours Editor Component
export function HoursEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs leading-relaxed text-stone-500">
      ℹ️ This section displays your operating hours. Configure your weekly hours using the main <strong>Opening Hours</strong> panel below in the form.
    </div>
  );
}

// 5. Location Editor Component
export function LocationEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const mapUrl = data.google_maps_url || "";
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Google Maps Embed URL</label>
        <input
          type="text"
          value={mapUrl}
          onChange={(e) => onChange({ ...data, google_maps_url: e.target.value })}
          className="input text-xs h-9 bg-white"
          placeholder="e.g. https://www.google.com/maps/embed?pb=..."
        />
        <p className="text-[9px] text-stone-400 leading-tight">
          To get this, open Google Maps → click Share → select "Embed a map" tab → copy only the `src` attribute from the iframe code.
        </p>
      </div>
      <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/50 text-[10px] text-stone-500 leading-relaxed">
        ℹ️ The text address and directions button are automatically linked from the main card address fields.
      </div>
    </div>
  );
}

// 6. Review Editor Component
export function ReviewEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const gUrl = data.google_review_url || "";
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Google Maps Review Link</label>
        <input
          type="text"
          value={gUrl}
          onChange={(e) => onChange({ ...data, google_review_url: e.target.value })}
          className="input text-xs h-9 bg-white"
          placeholder="e.g. https://g.page/r/..."
        />
      </div>
      <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs leading-relaxed text-stone-500">
        ⭐ <strong>Sentiment Gating Enabled:</strong> Happy ratings 🙂 auto-route to this link. Unhappy ratings 🙁 display a private feedback form that logs securely to your Inbox.
      </div>
    </div>
  );
}

// 7. Booking Editor Component
export function BookingEditor({ data, onChange, plan }: { data: any; onChange: (d: any) => void; plan?: string }) {
  const mode = data.mode || "link";
  const url = data.booking_url || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-stone-700">Booking Mode:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...data, mode: "link" })}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
              mode === "link" ? "bg-brand text-white border-brand" : "bg-white text-stone-600"
            }`}
          >
            Link Out (Mode A)
          </button>
          <button
            type="button"
            onClick={() => {
              if (plan !== "business") {
                alert("Booking Request Form (Mode B) is a Business plan feature. Please upgrade to unlock.");
                return;
              }
              onChange({ ...data, mode: "form" });
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 ${
              mode === "form" ? "bg-brand text-white border-brand" : "bg-white text-stone-600"
            }`}
          >
            {plan !== "business" && <span className="text-[10px]">🔒</span>}
            Request Form (Mode B)
          </button>
        </div>
      </div>

      {mode === "link" ? (
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Booking Link URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => onChange({ ...data, booking_url: e.target.value })}
            className="input text-xs h-9 bg-white"
            placeholder="e.g. https://calendly.com/your-username"
          />
        </div>
      ) : (
        <div className="bg-purple-50 border border-purple-100 p-3.5 rounded-xl text-xs leading-relaxed text-purple-900">
          📝 <strong>Built-in Booking Request:</strong> Customers submit booking requests containing their Name, Phone, Service, and Date. Submissions trigger client-side WhatsApp redirects and log directly into your dashboard.
        </div>
      )}
    </div>
  );
}

// 8. Wifi Editor Component
export function WifiEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const ssid = data.ssid || "";
  const password = data.password || "";
  const showPassword = data.show_password !== false;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Network SSID (Name)</label>
          <input
            type="text"
            value={ssid}
            onChange={(e) => onChange({ ...data, ssid: e.target.value })}
            className="input text-xs h-9 bg-white"
            placeholder="e.g. Guest_WiFi"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Password</label>
          <input
            type="text"
            value={password}
            onChange={(e) => onChange({ ...data, password: e.target.value })}
            className="input text-xs h-9 bg-white"
            placeholder="e.g. wifi12345"
          />
        </div>
      </div>
      <label className="flex items-center gap-1.5 text-xs text-stone-600 font-medium cursor-pointer">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(e) => onChange({ ...data, show_password: e.target.checked })}
          className="rounded border-stone-300 text-brand focus:ring-brand"
        />
        Display password on card (allow manual typing)
      </label>

      <div className="bg-stone-50 border border-stone-200/80 p-3.5 rounded-xl text-[11px] leading-relaxed text-stone-600 space-y-1.5 shadow-sm">
        <p className="font-semibold text-stone-700 flex items-center gap-1">
          <span>💡</span> <span>Offline Bootstrapping Tip (Walled Garden)</span>
        </p>
        <p>
          If guests don't have active cellular data to scan your card, set your Guest WiFi network to <strong>Open</strong> (passwordless) with a captive portal or <strong>Walled Garden</strong> (DNS Whitelisting) on your router to allow traffic only to your card domain (e.g., <code>one-qr-card.vercel.app</code>).
        </p>
        <p>
          This allows guests to scan the QR, load this digital profile, browse your services/menu, and connect to the internet, even without a cell signal!
        </p>
      </div>
    </div>
  );
}

// 9. Lead Capture Editor Component
export function LeadCaptureEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const title = data.title || "Get in Touch";
  const success = data.success_message || "Thank you! We'll get back to you shortly.";
  const fields = data.fields || { name: true, phone: true, email: true, message: true };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Form Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="input text-xs h-9 bg-white"
            placeholder="e.g. Free Consultation"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Success Message</label>
          <input
            type="text"
            value={success}
            onChange={(e) => onChange({ ...data, success_message: e.target.value })}
            className="input text-xs h-9 bg-white"
            placeholder="e.g. Thanks! We'll reply in 2 hours."
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Form Fields Enabled</span>
        <div className="flex flex-wrap gap-4 text-xs">
          <label className="flex items-center gap-1.5 text-stone-600 font-medium">
            <input type="checkbox" checked disabled className="rounded border-stone-300 text-stone-400" />
            Name (Always On)
          </label>
          <label className="flex items-center gap-1.5 text-stone-600 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={!!fields.phone}
              onChange={(e) => onChange({ ...data, fields: { ...fields, phone: e.target.checked } })}
              className="rounded border-stone-300 text-brand focus:ring-brand"
            />
            Phone Number
          </label>
          <label className="flex items-center gap-1.5 text-stone-600 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={!!fields.email}
              onChange={(e) => onChange({ ...data, fields: { ...fields, email: e.target.checked } })}
              className="rounded border-stone-300 text-brand focus:ring-brand"
            />
            Email Address
          </label>
          <label className="flex items-center gap-1.5 text-stone-600 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={!!fields.message}
              onChange={(e) => onChange({ ...data, fields: { ...fields, message: e.target.checked } })}
              className="rounded border-stone-300 text-brand focus:ring-brand"
            />
            Short Message
          </label>
        </div>
      </div>
    </div>
  );
}

// 10. Amenities Editor Component
export function AmenitiesEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const current = data.amenities || [];
  const [customText, setCustomText] = useState("");

  const presets = [
    { label: "Free WiFi", emoji: "📶" },
    { label: "Swimming Pool", emoji: "🏊" },
    { label: "Free Parking", emoji: "🅿️" },
    { label: "Gym / Fitness Center", emoji: "💪" },
    { label: "Air Conditioning", emoji: "❄️" },
    { label: "Hot Water", emoji: "🚿" },
    { label: "Room Service", emoji: "🛎️" },
    { label: "Spa / Sauna", emoji: "🧖" },
    { label: "Restaurant", emoji: "🍽️" },
    { label: "Bar / Lounge", emoji: "🍸" },
  ];

  function togglePreset(label: string, emoji: string) {
    const exists = current.find((a: any) => a.label === label);
    let next;
    if (exists) {
      next = current.filter((a: any) => a.label !== label);
    } else {
      next = [...current, { id: nanoid(6), label, emoji }];
    }
    onChange({ ...data, amenities: next });
  }

  function addCustom() {
    if (!customText.trim()) return;
    const newItem = {
      id: nanoid(6),
      label: customText.trim(),
      emoji: "✨",
    };
    onChange({ ...data, amenities: [...current, newItem] });
    setCustomText("");
  }

  function removeAmenity(id: string) {
    onChange({ ...data, amenities: current.filter((a: any) => a.id !== id) });
  }

  return (
    <div className="space-y-4">
      {/* Preset List Checkboxes */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Amenities presets</span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {presets.map((p) => {
            const checked = !!current.find((a: any) => a.label === p.label);
            return (
              <label key={p.label} className="flex items-center gap-1.5 text-stone-600 font-medium cursor-pointer p-1 hover:bg-stone-50 rounded">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePreset(p.label, p.emoji)}
                  className="rounded border-stone-300 text-brand focus:ring-brand"
                />
                <span>{p.emoji}</span> <span>{p.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Custom Amenity Adder */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Custom amenity (e.g. Kid-friendly)..."
          className="input text-xs h-9 bg-white flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <button
          type="button"
          onClick={addCustom}
          className="bg-stone-900 text-white text-xs px-3 rounded-lg hover:bg-stone-800 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Selected List Tags */}
      {current.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {current.map((a: any) => (
            <span key={a.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-semibold rounded-lg">
              <span>{a.emoji}</span> <span>{a.label}</span>
              <button
                type="button"
                onClick={() => removeAmenity(a.id)}
                className="text-stone-400 hover:text-stone-600 font-bold ml-1"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// 11. Schedule Editor Component
export function ScheduleEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const classes = data.classes || [];
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (justAddedId) {
      const el = document.getElementById(`class-item-${justAddedId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const input = el.querySelector("input");
        if (input) input.focus();
        setJustAddedId(null);
      }
    }
  }, [justAddedId]);

  function updateClasses(updated: any[]) {
    onChange({ ...data, classes: updated });
  }

  function addClass() {
    const newId = nanoid(6);
    const newItem = {
      id: newId,
      name: "New Class / Session",
      day: "monday",
      time: "10:00 AM",
      instructor: "",
      capacity: "",
      is_full: false,
    };
    updateClasses([...classes, newItem]);
    setJustAddedId(newId);
  }

  function updateClass(id: string, field: string, val: any) {
    const next = classes.map((c: any) => (c.id === id ? { ...c, [field]: val } : c));
    updateClasses(next);
  }

  function deleteClass(id: string) {
    updateClasses(classes.filter((c: any) => c.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Sticky Classes Header */}
      <div className="sticky top-0 bg-white z-20 py-3.5 border-b border-stone-200 -mx-4 px-4 flex justify-between items-center shadow-sm">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Weekly Classes</h4>
        <button
          type="button"
          onClick={addClass}
          className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          + Add Session
        </button>
      </div>

      <div className="space-y-4">
        {classes.length === 0 ? (
          <p className="text-stone-400 text-xs text-center py-6">No sessions configured.</p>
        ) : (
          classes.map((c: any, idx: number) => {
            const isLastItem = idx === classes.length - 1;
            const onLastAction = isLastItem
              ? () => addClass()
              : () => {
                  const nextId = classes[idx + 1].id;
                  setTimeout(() => {
                    const nextEl = document.getElementById(`class-item-${nextId}`);
                    const input = nextEl?.querySelector('input:not([type="checkbox"]):not([type="file"])') as HTMLInputElement;
                    input?.focus();
                  }, 0);
                };

            return (
              <div
                key={c.id}
                id={`class-item-${c.id}`}
                className="bg-stone-50 border border-stone-250 p-4 rounded-xl relative grid gap-3.5 scroll-mt-20"
              >
                <button
                  type="button"
                  onClick={() => deleteClass(c.id)}
                  className="absolute top-3 right-3 text-stone-400 hover:text-red-500 font-semibold text-xs"
                >
                  Remove
                </button>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Session Name</label>
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateClass(c.id, "name", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. Power Yoga"
                      onKeyDown={(e) => handleInputKeyDown(e, c.id, "class-item", onLastAction)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Day</label>
                    <select
                      value={c.day}
                      onChange={(e) => updateClass(c.id, "day", e.target.value)}
                      className="h-9 w-full rounded-lg border border-stone-200 bg-white px-2 text-xs outline-none"
                    >
                      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                        <option key={day} value={day} className="capitalize">
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Time</label>
                    <input
                      type="text"
                      value={c.time}
                      onChange={(e) => updateClass(c.id, "time", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. 08:00 AM - 09:30 AM"
                      onKeyDown={(e) => handleInputKeyDown(e, c.id, "class-item", onLastAction)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 items-center">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Instructor</label>
                    <input
                      type="text"
                      value={c.instructor || ""}
                      onChange={(e) => updateClass(c.id, "instructor", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. John Doe"
                      onKeyDown={(e) => handleInputKeyDown(e, c.id, "class-item", onLastAction)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Capacity</label>
                    <input
                      type="text"
                      value={c.capacity || ""}
                      onChange={(e) => updateClass(c.id, "capacity", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. 15 spots"
                      onKeyDown={(e) => handleInputKeyDown(e, c.id, "class-item", onLastAction)}
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-stone-600 font-medium cursor-pointer self-end py-2">
                    <input
                      type="checkbox"
                      checked={!!c.is_full}
                      onChange={(e) => updateClass(c.id, "is_full", e.target.checked)}
                      className="rounded border-stone-300 text-brand focus:ring-brand"
                    />
                    Mark as Full / Booked
                  </label>
                </div>
              </div>
            );
          })
        )}
      </div>

      {classes.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={addClass}
            className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            + Add Session
          </button>
        </div>
      )}
    </div>
  );
}

// 12. Pricing Table Editor Component
export function PricingTableEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const plans = data.plans || [];
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (justAddedId) {
      const el = document.getElementById(`plan-item-${justAddedId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const input = el.querySelector("input");
        if (input) input.focus();
        setJustAddedId(null);
      }
    }
  }, [justAddedId]);

  function updatePlans(updated: any[]) {
    onChange({ ...data, plans: updated });
  }

  function addPlan() {
    const newId = nanoid(6);
    const newItem = {
      id: newId,
      name: "Standard Plan",
      price: "$19/mo",
      features: "Feature 1\nFeature 2",
      is_popular: false,
      cta_link: "",
      cta_label: "Choose Plan",
    };
    updatePlans([...plans, newItem]);
    setJustAddedId(newId);
  }

  function updatePlan(id: string, field: string, val: any) {
    const next = plans.map((p: any) => (p.id === id ? { ...p, [field]: val } : p));
    updatePlans(next);
  }

  function deletePlan(id: string) {
    updatePlans(plans.filter((p: any) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Sticky Packages Header */}
      <div className="sticky top-0 bg-white z-20 py-3.5 border-b border-stone-200 -mx-4 px-4 flex justify-between items-center shadow-sm">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Pricing Packages</h4>
        <button
          type="button"
          onClick={addPlan}
          className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          + Add Package
        </button>
      </div>

      <div className="space-y-4">
        {plans.length === 0 ? (
          <p className="text-stone-400 text-xs text-center py-6">No packages configured.</p>
        ) : (
          plans.map((p: any, idx: number) => {
            const isLastItem = idx === plans.length - 1;
            const onLastAction = isLastItem
              ? () => addPlan()
              : () => {
                  const nextId = plans[idx + 1].id;
                  setTimeout(() => {
                    const nextEl = document.getElementById(`plan-item-${nextId}`);
                    const input = nextEl?.querySelector('input:not([type="checkbox"]):not([type="file"])') as HTMLInputElement;
                    input?.focus();
                  }, 0);
                };

            return (
              <div
                key={p.id}
                id={`plan-item-${p.id}`}
                className="bg-stone-50 border border-stone-250 p-4 rounded-xl relative grid gap-3.5 animate-fade-in scroll-mt-20"
              >
                <button
                  type="button"
                  onClick={() => deletePlan(p.id)}
                  className="absolute top-3 right-3 text-stone-400 hover:text-red-500 font-semibold text-xs"
                >
                  Remove
                </button>

                <div className="grid sm:grid-cols-2 gap-4 pr-14">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Package Title</label>
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => updatePlan(p.id, "name", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. Monthly Pass"
                      onKeyDown={(e) => handleInputKeyDown(e, p.id, "plan-item", onLastAction)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Price Details</label>
                    <input
                      type="text"
                      value={p.price}
                      onChange={(e) => updatePlan(p.id, "price", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. $19 / mon"
                      onKeyDown={(e) => handleInputKeyDown(e, p.id, "plan-item", onLastAction)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Features list (one per line)</label>
                  <textarea
                    rows={2}
                    value={p.features}
                    onChange={(e) => updatePlan(p.id, "features", e.target.value)}
                    className="input text-xs py-2 bg-white resize-none"
                    placeholder="Feature A&#10;Feature B"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4 items-center">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Button Link (URL)</label>
                    <input
                      type="text"
                      value={p.cta_link || ""}
                      onChange={(e) => updatePlan(p.id, "cta_link", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. https://payment-link.com"
                      onKeyDown={(e) => handleInputKeyDown(e, p.id, "plan-item", onLastAction)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Button Label</label>
                    <input
                      type="text"
                      value={p.cta_label || ""}
                      onChange={(e) => updatePlan(p.id, "cta_label", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. Buy Now"
                      onKeyDown={(e) => handleInputKeyDown(e, p.id, "plan-item", onLastAction)}
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-stone-600 font-medium cursor-pointer self-end py-2">
                    <input
                      type="checkbox"
                      checked={!!p.is_popular}
                      onChange={(e) => updatePlan(p.id, "is_popular", e.target.checked)}
                      className="rounded border-stone-300 text-brand focus:ring-brand"
                    />
                    ⭐ Highlight Plan (Most Popular)
                  </label>
                </div>
              </div>
            );
          })
        )}
      </div>

      {plans.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={addPlan}
            className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            + Add Package
          </button>
        </div>
      )}
    </div>
  );
}

// 13. Featured Products Editor Component
export function FeaturedProductsEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const products = data.products || [];
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (justAddedId) {
      const el = document.getElementById(`product-item-${justAddedId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const input = el.querySelector("input");
        if (input) input.focus();
        setJustAddedId(null);
      }
    }
  }, [justAddedId]);

  function updateProducts(updated: any[]) {
    onChange({ ...data, products: updated });
  }

  function addProduct() {
    const newId = nanoid(6);
    const newItem = {
      id: newId,
      name: "New Product Title",
      price: "$0",
      description: "",
      photo_url: "",
      shop_link: "",
    };
    updateProducts([...products, newItem]);
    setJustAddedId(newId);
  }

  function updateProduct(id: string, field: string, val: any) {
    const next = products.map((p: any) => (p.id === id ? { ...p, [field]: val } : p));
    updateProducts(next);
  }

  async function handleProductPhoto(id: string, file: File) {
    setUploadingId(id);
    try {
      const base64 = await compressImage(file);
      updateProduct(id, "photo_url", base64);
    } catch (err) {
      console.error("Product image compression failed:", err);
    }
    setUploadingId(null);
  }

  function deleteProduct(id: string) {
    updateProducts(products.filter((p: any) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Sticky Products Header */}
      <div className="sticky top-0 bg-white z-20 py-3.5 border-b border-stone-200 -mx-4 px-4 flex justify-between items-center shadow-sm">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Products list</h4>
        <button
          type="button"
          onClick={addProduct}
          className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          + Add Product
        </button>
      </div>

      <div className="space-y-4">
        {products.length === 0 ? (
          <p className="text-stone-400 text-xs text-center py-6">No products configured.</p>
        ) : (
          products.map((p: any, idx: number) => {
            const isLastItem = idx === products.length - 1;
            const onLastAction = isLastItem
              ? () => addProduct()
              : () => {
                  const nextId = products[idx + 1].id;
                  setTimeout(() => {
                    const nextEl = document.getElementById(`product-item-${nextId}`);
                    const input = nextEl?.querySelector('input:not([type="checkbox"]):not([type="file"])') as HTMLInputElement;
                    input?.focus();
                  }, 0);
                };

            return (
              <div
                key={p.id}
                id={`product-item-${p.id}`}
                className="bg-stone-50 border border-stone-250 p-4 rounded-xl relative grid gap-3.5 animate-fade-in scroll-mt-20"
              >
                <button
                  type="button"
                  onClick={() => deleteProduct(p.id)}
                  className="absolute top-3 right-3 text-stone-400 hover:text-red-500 font-semibold text-xs"
                >
                  Remove
                </button>

                <div className="grid sm:grid-cols-[1fr_120px] gap-4 items-center pr-14">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Product Name</label>
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => updateProduct(p.id, "name", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. Leather Wallet"
                      onKeyDown={(e) => handleInputKeyDown(e, p.id, "product-item", onLastAction)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Price</label>
                    <input
                      type="text"
                      value={p.price}
                      onChange={(e) => updateProduct(p.id, "price", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. $49"
                      onKeyDown={(e) => handleInputKeyDown(e, p.id, "product-item", onLastAction)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Short Description</label>
                  <textarea
                    rows={2}
                    value={p.description || ""}
                    onChange={(e) => updateProduct(p.id, "description", e.target.value)}
                    className="input text-xs py-2 bg-white resize-none"
                    placeholder="e.g. Genuine leather, minimalist cardholder wallet..."
                  />
                </div>

                <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">External Store URL (Optional)</label>
                    <input
                      type="text"
                      value={p.shop_link || ""}
                      onChange={(e) => updateProduct(p.id, "shop_link", e.target.value)}
                      className="input text-xs h-9 bg-white"
                      placeholder="e.g. https://daraz.com.np/..."
                      onKeyDown={(e) => handleInputKeyDown(e, p.id, "product-item", onLastAction)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {p.photo_url && (
                      <img
                        src={p.photo_url}
                        alt={p.name}
                        className="w-8 h-8 rounded object-cover border border-stone-200"
                      />
                    )}
                    <label className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 text-[10px] font-bold px-2.5 py-2 rounded-lg cursor-pointer transition-all">
                      {uploadingId === p.id ? "Loading..." : p.photo_url ? "Change Image" : "Upload Product Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingId !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleProductPhoto(p.id, file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {products.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={addProduct}
            className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            + Add Product
          </button>
        </div>
      )}
    </div>
  );
}

// 14 & 15. Simple placeholder panels for read-only sections
export function ContactEditor() {
  return (
    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs leading-relaxed text-stone-500">
      ℹ️ This section displays quick-action contact options. Configure your contact details using the main <strong>Contact &amp; social links</strong> section below in the form.
    </div>
  );
}

export function SocialsEditor() {
  return (
    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs leading-relaxed text-stone-500">
      ℹ️ This section displays quick-action social media cards. Configure your social details using the main <strong>Contact &amp; social links</strong> section below in the form.
    </div>
  );
}

export function CoursesEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const list = data.courses || [];
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (justAddedId) {
      const el = document.getElementById(`course-item-${justAddedId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const input = el.querySelector("input");
        if (input) input.focus();
        setJustAddedId(null);
      }
    }
  }, [justAddedId]);

  function updateList(updated: any[]) {
    onChange({ ...data, courses: updated });
  }

  function addCourse() {
    const newId = nanoid(6);
    updateList([...list, { id: newId, name: "Course Name", code: "", description: "" }]);
    setJustAddedId(newId);
  }

  return (
    <div className="space-y-4">
      {/* Sticky Courses Header */}
      <div className="sticky top-0 bg-white z-20 py-3.5 border-b border-stone-200 -mx-4 px-4 flex justify-between items-center shadow-sm">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Courses offered</h4>
        <button
          type="button"
          onClick={addCourse}
          className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          + Add Course
        </button>
      </div>

      <div className="space-y-4">
        {list.length === 0 ? (
          <p className="text-stone-400 text-xs text-center py-4">No courses configured.</p>
        ) : (
          list.map((c: any, idx: number) => {
            const isLastItem = idx === list.length - 1;
            const onLastAction = isLastItem
              ? () => addCourse()
              : () => {
                  const nextId = list[idx + 1].id;
                  setTimeout(() => {
                    const nextEl = document.getElementById(`course-item-${nextId}`);
                    const input = nextEl?.querySelector('input:not([type="checkbox"]):not([type="file"])') as HTMLInputElement;
                    input?.focus();
                  }, 0);
                };

            return (
              <div
                key={c.id}
                id={`course-item-${c.id}`}
                className="bg-stone-50 border border-stone-200 p-4 rounded-xl relative grid gap-3 scroll-mt-20"
              >
                <button
                  type="button"
                  onClick={() => updateList(list.filter((x: any) => x.id !== c.id))}
                  className="absolute top-2 right-2 text-stone-400 hover:text-red-500 font-semibold text-xs"
                >
                  Remove
                </button>

                <div className="grid sm:grid-cols-2 gap-4 pr-14">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateList(list.map((x: any) => x.id === c.id ? { ...x, name: e.target.value } : x))}
                    className="input text-xs bg-white h-9"
                    placeholder="Course Name"
                    onKeyDown={(e) => handleInputKeyDown(e, c.id, "course-item", onLastAction)}
                  />
                  <input
                    type="text"
                    value={c.code || ""}
                    onChange={(e) => updateList(list.map((x: any) => x.id === c.id ? { ...x, code: e.target.value } : x))}
                    className="input text-xs bg-white h-9"
                    placeholder="Course Code / Duration"
                    onKeyDown={(e) => handleInputKeyDown(e, c.id, "course-item", onLastAction)}
                  />
                </div>
                <textarea
                  value={c.description || ""}
                  onChange={(e) => updateList(list.map((x: any) => x.id === c.id ? { ...x, description: e.target.value } : x))}
                  className="input text-xs py-2 bg-white resize-none"
                  placeholder="Description..."
                  rows={1.5}
                />
              </div>
            );
          })
        )}
      </div>

      {list.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={addCourse}
            className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            + Add Course
          </button>
        </div>
      )}
    </div>
  );
}
