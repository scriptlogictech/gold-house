
import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import crmApi from "../../services/crmApi";
import "./Products.css";

const PAGE_SIZE = 10;
const CATEGORIES = ["Gold", "Diamond", "Silver", "NKM Nosepins"];

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
  imageUrls: "",
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

export default function Products() {
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

  // Load products
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

  // Product statistics
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

  // Open add product modal
  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError("");
    setModal(true);
  };

  // Open edit product modal
  const openEdit = (product) => {
    setEditing(product);

    setForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "Gold",
      description: product.description || "",
      brand: product.brand || "",

      // Backend stores metal as a string.
      // This also supports older object-based records.
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

      imageUrls: imageList(product)
        .map((img) =>
          typeof img === "string"
            ? img
            : img.url || img.secure_url || ""
        )
        .filter(Boolean)
        .join("\n"),

      featured: Boolean(product.featured),
      isActive: product.isActive !== false,
      showOnWebsite: product.showOnWebsite !== false,
    });

    setFormError("");
    setModal(true);
  };

  // Update form fields
  const setField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // Save product
  const saveProduct = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      return setFormError("Please enter the product name.");
    }

    const images = form.imageUrls
      .split(/\n|,/)
      .map((url) => url.trim())
      .filter(Boolean);

    if (
      images.some(
        (url) => !/^https?:\/\/.+/i.test(url)
      )
    ) {
      return setFormError(
        "Please enter valid http(s) image URLs, one per line."
      );
    }

    // IMPORTANT:
    // Backend expects metal and purity as separate strings.
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim() || undefined,
      category: form.category,
      description: form.description.trim(),
      brand: form.brand.trim(),
      images,

      metal: form.metalType,
      purity: form.purity.trim(),

      grossWeight:
        form.grossWeight === ""
          ? undefined
          : Number(form.grossWeight),

      netWeight:
        form.netWeight === ""
          ? undefined
          : Number(form.netWeight),

      featured: form.featured,
      isActive: form.isActive,
      showOnWebsite: form.showOnWebsite,
    };

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

  // Activate / deactivate product
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

  // Delete product
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

  return (
    <div className="gh-products-page">
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

        {loading ? (
          <div className="gh-product-state">
            <RefreshCw
              className="gh-product-spin"
              size={22}
            />
            Loading products…
          </div>
        ) : visibleProducts.length === 0 ? (
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

                  const imageUrl =
                    typeof firstImage === "string"
                      ? firstImage
                      : firstImage?.url ||
                        firstImage?.secure_url;

                  return (
                    <tr key={getId(product)}>
                      <td>
                        <div className="gh-product-identity">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt=""
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
                            onClick={() =>
                              toggleStatus(product)
                            }
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
                            onClick={() =>
                              deleteProduct(product)
                            }
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

      {modal && (
        <div
          className="gh-product-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
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
            <div className="gh-product-modal-head">
              <div>
                <span className="gh-products-eyebrow">
                  {editing
                    ? "UPDATE CATALOGUE ITEM"
                    : "NEW CATALOGUE ITEM"}
                </span>

                <h2 id="gh-product-form-title">
                  {editing
                    ? "Edit product"
                    : "Add new product"}
                </h2>
              </div>

              <button
                onClick={() => setModal(false)}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveProduct}>
              <div className="gh-product-form-grid">
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

                <label className="wide">
                  Product image URLs
                  <textarea
                    rows="3"
                    value={form.imageUrls}
                    onChange={(e) =>
                      setField("imageUrls", e.target.value)
                    }
                    placeholder="Paste image URLs, one per line"
                  />
                  <small>
                    Use publicly accessible https image links.
                    Image upload can be connected when the
                    backend storage provider is configured.
                  </small>
                </label>
              </div>

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

              <div className="gh-product-price-note">
                Public catalogue uses{" "}
                <strong>Enquiry only</strong>. Product prices
                are not collected or displayed here.
              </div>

              {formError && (
                <div className="gh-product-error" role="alert">
                  {formError}
                </div>
              )}

              <div className="gh-product-form-actions">
                <button
                  type="button"
                  className="gh-product-secondary"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="gh-product-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
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
