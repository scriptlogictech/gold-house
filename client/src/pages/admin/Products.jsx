
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  X,
  Package,
  Gem,
  ImagePlus,
  Upload,
} from "lucide-react";
import crmApi from "../../services/crmApi";
import "./Products.css";

const PAGE_SIZE = 10;
const MAX_IMAGES = 12;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const CATEGORIES = ["Gold", "Diamond", "Silver", "NKM Nosepins"];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const emptyForm = {
  name: "",
  sku: "",
  category: "Gold",
  description: "",
  brand: "",
  metalType: "Gold",
  purity: "",
  grossWeight: "",
  netWeight: "",
  featured: false,
  isActive: true,
  showOnWebsite: true,
};

const unwrapList = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.products)) return payload.products;

  if (Array.isArray(payload?.data?.products)) {
    return payload.data.products;
  }

  return [];
};

const getId = (product) => product?._id || product?.id;

const imageList = (product) =>
  Array.isArray(product?.images) ? product.images : [];

const getImageUrl = (image) => {
  if (typeof image === "string") return image;

  return image?.url || image?.secure_url || "";
};

export default function Products() {
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // Existing Cloudinary image URLs retained during editing.
  const [existingImages, setExistingImages] = useState([]);

  // Newly selected local image files.
  const [imageFiles, setImageFiles] = useState([]);

  // --------------------------------------------------
  // LOAD PRODUCTS
  // --------------------------------------------------

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await crmApi.get("/products/admin/all", {
        params: {
          page: 1,
          limit: 500,
          search: search.trim() || undefined,
          category:
            category === "All categories" ? undefined : category,
        },
      });

      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(
          payload.message || "Unable to load products."
        );
      }

      setProducts(unwrapList(payload));
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // --------------------------------------------------
  // IMAGE PREVIEW URL CLEANUP
  // --------------------------------------------------

  const imagePreviews = useMemo(
    () =>
      imageFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [imageFiles]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
    };
  }, [imagePreviews]);

  // --------------------------------------------------
  // PRODUCT STATISTICS
  // --------------------------------------------------

  const activeCount = products.filter(
    (product) => product.isActive !== false
  ).length;

  const websiteCount = products.filter(
    (product) =>
      product.showOnWebsite !== false &&
      product.isActive !== false
  ).length;

  const totalPages = Math.max(
    1,
    Math.ceil(products.length / PAGE_SIZE)
  );

  const visibleProducts = useMemo(
    () =>
      products.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
      ),
    [products, page]
  );

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  const resetForm = () => {
    setForm({ ...emptyForm });
    setExistingImages([]);
    setImageFiles([]);
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --------------------------------------------------
  // OPEN ADD PRODUCT
  // --------------------------------------------------

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setModal(true);
  };

  // --------------------------------------------------
  // OPEN EDIT PRODUCT
  // --------------------------------------------------

  const openEdit = (product) => {
    setEditing(product);

    const productImages = imageList(product)
      .map(getImageUrl)
      .filter(Boolean);

    setForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "Gold",
      description: product.description || "",
      brand: product.brand || "",

      metalType:
        typeof product.metal === "string"
          ? product.metal
          : product.metal?.type ||
            product.metalType ||
            "Gold",

      purity:
        product.purity ||
        (typeof product.metal === "object"
          ? product.metal?.purity
          : "") ||
        "",

      grossWeight: product.grossWeight ?? "",
      netWeight: product.netWeight ?? "",

      featured: Boolean(product.featured),
      isActive: product.isActive !== false,
      showOnWebsite: product.showOnWebsite !== false,
    });

    setExistingImages(productImages);
    setImageFiles([]);
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setModal(true);
  };

  // --------------------------------------------------
  // UPDATE FORM FIELDS
  // --------------------------------------------------

  const setField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // --------------------------------------------------
  // SELECT PRODUCT IMAGES
  // --------------------------------------------------

  const handleImageSelection = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    setFormError("");

    if (!selectedFiles.length) return;

    const validFiles = [];

    for (const file of selectedFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setFormError(
          `${file.name}: Only JPG, PNG, WEBP and AVIF images are allowed.`
        );
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setFormError(
          `${file.name}: Image size must not exceed 5 MB.`
        );
        continue;
      }

      validFiles.push(file);
    }

    const availableSlots =
      MAX_IMAGES - existingImages.length - imageFiles.length;

    if (availableSlots <= 0) {
      setFormError(
        `You can upload a maximum of ${MAX_IMAGES} images per product.`
      );

      event.target.value = "";
      return;
    }

    const filesToAdd = validFiles.slice(0, availableSlots);

    if (validFiles.length > availableSlots) {
      setFormError(
        `Only ${availableSlots} more image(s) can be added. Maximum is ${MAX_IMAGES}.`
      );
    }

    setImageFiles((previous) => [
      ...previous,
      ...filesToAdd,
    ]);

    // Allow selecting the same file again after removing it.
    event.target.value = "";
  };

  // --------------------------------------------------
  // REMOVE EXISTING IMAGE
  // --------------------------------------------------

  const removeExistingImage = (index) => {
    setExistingImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  // --------------------------------------------------
  // REMOVE NEW IMAGE
  // --------------------------------------------------

  const removeSelectedImage = (index) => {
    setImageFiles((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  // --------------------------------------------------
  // SAVE PRODUCT USING FORMDATA
  // --------------------------------------------------

  const saveProduct = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      return setFormError("Please enter the product name.");
    }

    if (
      existingImages.length + imageFiles.length >
      MAX_IMAGES
    ) {
      return setFormError(
        `You can upload a maximum of ${MAX_IMAGES} images.`
      );
    }

    const payload = new FormData();

    payload.append("name", form.name.trim());
    payload.append("sku", form.sku.trim());
    payload.append("category", form.category);
    payload.append("description", form.description.trim());
    payload.append("brand", form.brand.trim());

    // Backend expects metal and purity as separate strings.
    payload.append("metal", form.metalType);
    payload.append("purity", form.purity.trim());

    if (form.grossWeight !== "") {
      payload.append("grossWeight", String(Number(form.grossWeight)));
    }

    if (form.netWeight !== "") {
      payload.append("netWeight", String(Number(form.netWeight)));
    }

    payload.append("featured", String(form.featured));
    payload.append("isActive", String(form.isActive));
    payload.append("showOnWebsite", String(form.showOnWebsite));

    // Existing images that should remain on the product.
    payload.append(
      "existingImages",
      JSON.stringify(existingImages)
    );

    // Newly selected local image files.
    imageFiles.forEach((file) => {
      payload.append("images", file);
    });

    setSaving(true);

    try {
      if (editing) {
        await crmApi.patch(
          `/products/${getId(editing)}`,
          payload
        );
      } else {
        await crmApi.post("/products", payload);
      }

      setNotice(
        editing
          ? "Product updated successfully."
          : "Product added successfully."
      );

      setModal(false);
      resetForm();

      await loadProducts();
    } catch (e) {
      setFormError(
        e.response?.data?.message ||
          e.message ||
          "Could not save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // ACTIVATE / DEACTIVATE PRODUCT
  // --------------------------------------------------

  const toggleStatus = async (product) => {
    try {
      await crmApi.patch(
        `/products/${getId(product)}/status`,
        {
          isActive: product.isActive === false,
        }
      );

      setNotice(
        product.isActive === false
          ? "Product activated."
          : "Product deactivated."
      );

      await loadProducts();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          "Could not update product status."
      );
    }
  };

  // --------------------------------------------------
  // DELETE PRODUCT
  // --------------------------------------------------

  const deleteProduct = async (product) => {
    if (
      !window.confirm(
        `Move "${product.name}" out of the active product catalogue?`
      )
    ) {
      return;
    }

    try {
      await crmApi.delete(
        `/products/${getId(product)}`
      );

      setNotice("Product removed from the catalogue.");
      await loadProducts();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          "Could not remove product."
      );
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="gh-products-page">
      {/* PAGE HEADING */}

      <div className="gh-products-heading">
        <div>
          <span className="gh-products-eyebrow">
            CATALOGUE MANAGEMENT
          </span>

          <h1>Products</h1>

          <p>
            Add and manage jewellery designs displayed in
            the Gold House collection.
          </p>
        </div>

        <button
          className="gh-product-primary"
          onClick={openAdd}
        >
          <Plus size={17} />
          Add Product
        </button>
      </div>

      {/* STATISTICS */}

      <div className="gh-product-stats">
        <div>
          <span>Total products</span>
          <strong>{loading ? "—" : products.length}</strong>
          <small>Products returned by the CRM</small>
        </div>

        <div>
          <span>Active products</span>
          <strong>{loading ? "—" : activeCount}</strong>
          <small>Available for staff catalogue</small>
        </div>

        <div>
          <span>Visible on website</span>
          <strong>{loading ? "—" : websiteCount}</strong>
          <small>Active products enabled for website</small>
        </div>
      </div>

      {/* NOTIFICATIONS */}

      {notice && (
        <div className="gh-product-notice" role="status">
          {notice}

          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div className="gh-product-error" role="alert">
          {error}

          <button onClick={loadProducts}>
            Try again
          </button>
        </div>
      )}

      {/* PRODUCT CATALOGUE */}

      <section className="gh-product-panel">
        <div className="gh-product-panel-head">
          <div>
            <h2>Product catalogue</h2>
            <p>
              Search, edit and control website visibility.
            </p>
          </div>

          <button
            className="gh-product-secondary"
            onClick={loadProducts}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* SEARCH AND FILTER */}

        <div className="gh-product-toolbar">
          <label className="gh-product-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search product name or SKU"
            />
          </label>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option>All categories</option>

            {CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="gh-product-state">
            <RefreshCw
              className="gh-product-spin"
              size={22}
            />
            Loading products…
          </div>
        ) : visibleProducts.length === 0 ? (
          /* EMPTY STATE */

          <div className="gh-product-empty">
            <div>
              <Package size={26} />
            </div>

            <h3>No products found</h3>

            <p>
              Add your first jewellery design to start
              building the catalogue.
            </p>

            <button
              className="gh-product-primary"
              onClick={openAdd}
            >
              <Plus size={16} />
              Add your first product
            </button>
          </div>
        ) : (
          /* PRODUCT TABLE */

          <div className="gh-product-table-wrap">
            <table className="gh-product-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>SKU</th>
                  <th>Status</th>
                  <th>Website</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map((product) => {
                  const firstImage = imageList(product)[0];
                  const imageUrl = getImageUrl(firstImage);

                  return (
                    <tr key={getId(product)}>
                      <td>
                        <div className="gh-product-identity">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name || "Product"}
                            />
                          ) : (
                            <span className="gh-product-placeholder">
                              <Gem size={19} />
                            </span>
                          )}

                          <div>
                            <strong>{product.name}</strong>

                            <small>
                              {product.brand ||
                                product.purity ||
                                "Jewellery design"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{product.category || "—"}</td>
                      <td>{product.sku || "—"}</td>

                      <td>
                        <span
                          className={`gh-product-status ${
                            product.isActive === false
                              ? "inactive"
                              : "active"
                          }`}
                        >
                          {product.isActive === false
                            ? "Inactive"
                            : "Active"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`gh-product-status ${
                            product.showOnWebsite === false
                              ? "inactive"
                              : "active"
                          }`}
                        >
                          {product.showOnWebsite === false
                            ? "Hidden"
                            : "Visible"}
                        </span>
                      </td>

                      <td>
                        <div className="gh-product-actions">
                          <button
                            title="Edit product"
                            onClick={() => openEdit(product)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            title={
                              product.isActive === false
                                ? "Activate"
                                : "Deactivate"
                            }
                            onClick={() => toggleStatus(product)}
                          >
                            {product.isActive === false ? (
                              <Eye size={16} />
                            ) : (
                              <EyeOff size={16} />
                            )}
                          </button>

                          <button
                            title="Remove product"
                            className="danger"
                            onClick={() => deleteProduct(product)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}

        {!loading && products.length > PAGE_SIZE && (
          <div className="gh-product-pagination">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(
                page * PAGE_SIZE,
                products.length
              )}{" "}
              of {products.length}
            </span>

            <div>
              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((previous) => previous - 1)
                }
              >
                Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage((previous) => previous + 1)
                }
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ADD / EDIT PRODUCT MODAL */}

      {modal && (
        <div
          className="gh-product-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setModal(false);
            }
          }}
        >
          <section
            className="gh-product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gh-product-form-title"
          >
            {/* MODAL HEADER */}

            <div className="gh-product-modal-head">
              <div>
                <span className="gh-products-eyebrow">
                  {editing
                    ? "UPDATE CATALOGUE ITEM"
                    : "NEW CATALOGUE ITEM"}
                </span>

                <h2 id="gh-product-form-title">
                  {editing ? "Edit product" : "Add new product"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => !saving && setModal(false)}
                aria-label="Close"
                disabled={saving}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveProduct}>
              <div className="gh-product-form-grid">
                {/* PRODUCT NAME */}

                <label className="wide">
                  Product name *

                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setField("name", e.target.value)
                    }
                    placeholder="e.g. Traditional Gold Necklace"
                  />
                </label>

                {/* CATEGORY */}

                <label>
                  Category

                  <select
                    value={form.category}
                    onChange={(e) =>
                      setField("category", e.target.value)
                    }
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                {/* SKU */}

                <label>
                  SKU / Product code

                  <input
                    value={form.sku}
                    onChange={(e) =>
                      setField("sku", e.target.value)
                    }
                    placeholder="Optional unique code"
                  />
                </label>

                {/* BRAND */}

                <label>
                  Brand

                  <input
                    value={form.brand}
                    onChange={(e) =>
                      setField("brand", e.target.value)
                    }
                    placeholder="Brand or collection"
                  />
                </label>

                {/* METAL */}

                <label>
                  Metal type

                  <select
                    value={form.metalType}
                    onChange={(e) =>
                      setField("metalType", e.target.value)
                    }
                  >
                    <option>Gold</option>
                    <option>Diamond</option>
                    <option>Silver</option>
                    <option>Other</option>
                  </select>
                </label>

                {/* PURITY */}

                <label>
                  Purity

                  <input
                    value={form.purity}
                    onChange={(e) =>
                      setField("purity", e.target.value)
                    }
                    placeholder="e.g. 22K, 18K, 925"
                  />
                </label>

                {/* GROSS WEIGHT */}

                <label>
                  Gross weight (g)

                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.grossWeight}
                    onChange={(e) =>
                      setField("grossWeight", e.target.value)
                    }
                    placeholder="0.000"
                  />
                </label>

                {/* NET WEIGHT */}

                <label>
                  Net weight (g)

                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.netWeight}
                    onChange={(e) =>
                      setField("netWeight", e.target.value)
                    }
                    placeholder="0.000"
                  />
                </label>

                {/* DESCRIPTION */}

                <label className="wide">
                  Description

                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(e) =>
                      setField("description", e.target.value)
                    }
                    placeholder="Describe the design, craftsmanship and details…"
                  />
                </label>

                {/* IMAGE UPLOAD */}

                <div className="wide gh-product-image-section">
                  <div className="gh-product-image-heading">
                    <div>
                      <strong>Product images</strong>

                      <small>
                        Upload up to {MAX_IMAGES} images. JPG, PNG,
                        WEBP or AVIF. Maximum 5 MB per image.
                      </small>
                    </div>

                    <span>
                      {existingImages.length + imageFiles.length}/
                      {MAX_IMAGES}
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    hidden
                    onChange={handleImageSelection}
                  />

                  <button
                    type="button"
                    className="gh-product-upload-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={
                      saving ||
                      existingImages.length + imageFiles.length >=
                        MAX_IMAGES
                    }
                  >
                    <ImagePlus size={20} />

                    <span>
                      <strong>Select product images</strong>
                      <small>
                        Choose images from your computer
                      </small>
                    </span>

                    <Upload size={18} />
                  </button>

                  {/* IMAGE PREVIEWS */}

                  {(existingImages.length > 0 ||
                    imagePreviews.length > 0) && (
                    <div className="gh-product-image-grid">
                      {existingImages.map((image, index) => (
                        <div
                          className="gh-product-image-card"
                          key={`existing-${image}-${index}`}
                        >
                          <img
                            src={image}
                            alt={`Existing product ${index + 1}`}
                          />

                          <span className="gh-product-image-label">
                            Saved image
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeExistingImage(index)
                            }
                            disabled={saving}
                            aria-label="Remove existing image"
                            title="Remove image"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ))}

                      {imagePreviews.map((image, index) => (
                        <div
                          className="gh-product-image-card"
                          key={`${image.file.name}-${index}`}
                        >
                          <img
                            src={image.url}
                            alt={`New product ${index + 1}`}
                          />

                          <span className="gh-product-image-label new">
                            New image
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeSelectedImage(index)
                            }
                            disabled={saving}
                            aria-label="Remove selected image"
                            title="Remove image"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {existingImages.length === 0 &&
                    imageFiles.length === 0 && (
                      <p className="gh-product-no-images">
                        No images selected yet.
                      </p>
                    )}
                </div>
              </div>

              {/* PRODUCT OPTIONS */}

              <div className="gh-product-options">
                <label>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setField("featured", e.target.checked)
                    }
                  />
                  Featured product
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setField("isActive", e.target.checked)
                    }
                  />
                  Active
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={form.showOnWebsite}
                    onChange={(e) =>
                      setField(
                        "showOnWebsite",
                        e.target.checked
                      )
                    }
                  />
                  Show on public website
                </label>
              </div>

              {/* PRICE NOTE */}

              <div className="gh-product-price-note">
                Public catalogue uses{" "}
                <strong>Enquiry only</strong>. Product prices
                are not collected or displayed here.
              </div>

              {/* FORM ERROR */}

              {formError && (
                <div className="gh-product-error" role="alert">
                  {formError}
                </div>
              )}

              {/* FORM BUTTONS */}

              <div className="gh-product-form-actions">
                <button
                  type="button"
                  className="gh-product-secondary"
                  onClick={() => {
                    if (!saving) setModal(false);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="gh-product-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Uploading and saving…"
                    : editing
                      ? "Save changes"
                      : "Save product"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
