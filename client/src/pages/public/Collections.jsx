import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Search,
  Sparkles,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { getPublicProducts } from "../../services/productService";
import "./Collections.css";

const categories = [
  "All Jewellery",
  "Gold",
  "Diamond",
  "Silver",
  "NKM Nosepins",
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=85";

export default function Collections() {
  const location = useLocation();

  const [activeCategory, setActiveCategory] = useState(
    location.state?.category || "All Jewellery"
  );
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setActiveCategory(location.state?.category || "All Jewellery");
  }, [location.state?.category]);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page: pagination.page,
          limit: 12,
        };

        if (activeCategory !== "All Jewellery") {
          params.category = activeCategory;
        }

        if (search.trim()) {
          params.search = search.trim();
        }

        const result = await getPublicProducts(params);

        if (!isMounted) return;

        setProducts(Array.isArray(result.data) ? result.data : []);
        setPagination((current) => ({
          ...current,
          ...(result.pagination || {}),
        }));
      } catch (err) {
        if (!isMounted) return;

        setProducts([]);
        setError(
          err.response?.data?.message ||
            "We couldn't load the collection right now. Please try again."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, search, pagination.page]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  return (
    <main className="collections-page">
      <div className="collections-topbar">
        <Link to="/" className="collections-back">
          <ArrowLeft size={16} />
          Back to Gold House
        </Link>

        <span className="collections-brand-label">
          GOLD HOUSE DSS · DALSINGHSARAI
        </span>
      </div>

      <section className="collections-hero">
        <div className="collections-hero-copy">
          <span className="collections-eyebrow">
            <span />
            FIND YOUR FAVOURITE
          </span>

          <h1>
            Jewellery for
            <br />
            <em>your moments.</em>
          </h1>

          <p>
            Explore jewellery inspiration across gold, diamond, silver and
            NKM Nosepins. Find a style you love and contact our showroom
            team for product details.
          </p>

          <a href="#collection-products" className="collections-hero-link">
            Explore the collection <ArrowRight size={17} />
          </a>
        </div>

        <div className="collections-hero-image">
          <img
            src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85"
            alt="Jewellery styling inspiration"
          />

          <div className="collections-image-label">
            <Sparkles size={16} />
            <span>MADE FOR YOUR MOMENTS</span>
          </div>
        </div>
      </section>

      <section className="collections-catalog" id="collection-products">
        <div className="collections-section-heading">
          <div>
            <span className="collections-eyebrow">OUR COLLECTIONS</span>
            <h2>
              Find your <em>kind of beautiful.</em>
            </h2>
          </div>

          <p>
            Browse the styles, search for inspiration and enquire about
            designs at our showroom.
          </p>
        </div>

        <div className="collections-toolbar">
          <div
            className="collections-filters"
            role="group"
            aria-label="Filter jewellery by category"
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  activeCategory === category
                    ? "collections-filter active"
                    : "collections-filter"
                }
                onClick={() => handleCategoryChange(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>

          <label className="collections-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search designs..."
              value={search}
              onChange={handleSearchChange}
              aria-label="Search jewellery designs"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPagination((current) => ({ ...current, page: 1 }));
                }}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </label>
        </div>

        <div className="collections-results">
          <span>
            {pagination.total} design{pagination.total === 1 ? "" : "s"}
          </span>

          <span>
            {activeCategory === "All Jewellery"
              ? "All categories"
              : activeCategory}
          </span>
        </div>

        <div className="collections-product-grid">
          {loading && (
            <div className="collections-empty">
              <RefreshCw size={28} />
              <h3>Discovering the collection</h3>
              <p>Please wait while we load our jewellery designs.</p>
            </div>
          )}

          {!loading &&
            !error &&
            products.map((product, index) => {
              const image =
                Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : FALLBACK_IMAGE;

              return (
                <article
                  className="collections-product-card"
                  key={product._id}
                >
                  <Link
                    to={`/products/${product.slug}`}
                    className="collections-product-image"
                    aria-label={`View ${product.name}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} jewellery`}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    <span className="collections-product-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {product.category === "NKM Nosepins" && (
                      <span className="collections-product-brand">
                        NKM NOSEPINS
                      </span>
                    )}

                    {product.featured && (
                      <span className="collections-featured-badge">
                        FEATURED STYLE
                      </span>
                    )}

                    <span className="collections-product-arrow">
                      <ArrowUpRight size={20} />
                    </span>
                  </Link>

                  <div className="collections-product-info">
                    <span className="collections-product-category">
                      {product.category?.toUpperCase()}
                    </span>

                    <h3>{product.name}</h3>

                    <p>{product.description || "Enquire for more details."}</p>

                    <Link
                      to={`/products/${product.slug}`}
                      className="collections-enquire-link"
                    >
                      Ask about this design <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}

          {!loading && error && (
            <div className="collections-empty">
              <MessageCircle size={28} />
              <h3>Collection unavailable</h3>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setPagination((current) => ({ ...current }))}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="collections-empty">
              <Search size={28} />
              <h3>No designs found</h3>
              <p>
                {search || activeCategory !== "All Jewellery"
                  ? "Try another search term or choose a different category."
                  : "New jewellery designs will appear here soon. Please check back later."}
              </p>

              {(search || activeCategory !== "All Jewellery") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    handleCategoryChange("All Jewellery");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {!loading && !error && pagination.totalPages > 1 && (
          <div className="collections-pagination">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() =>
                setPagination((current) => ({
                  ...current,
                  page: current.page - 1,
                }))
              }
            >
              <ArrowLeft size={16} /> Previous
            </button>

            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() =>
                setPagination((current) => ({
                  ...current,
                  page: current.page + 1,
                }))
              }
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        )}

        <p className="collections-disclaimer">
          Product details and images are provided for viewing and enquiry.
          Prices and availability can be confirmed directly with the showroom.
        </p>
      </section>

      <section className="collections-enquiry">
        <div className="collections-enquiry-icon">
          <MessageCircle size={25} />
        </div>

        <span className="collections-eyebrow">NEED A LITTLE HELP?</span>

        <h2>
          Found a style <em>you love?</em>
        </h2>

        <p>
          Contact Gold House DSS to ask about a design or plan your
          showroom visit in Dalsingsarai.
        </p>

        <Link to="/contact" className="collections-enquiry-button">
          Contact our showroom <ArrowUpRight size={17} />
        </Link>
      </section>

      <footer className="collections-footer">
        <Link to="/" className="collections-footer-brand">
          GOLD HOUSE DSS
        </Link>

        <span>Jewellery for the moments that matter.</span>

        <Link to="/collections">Back to top ↑</Link>
      </footer>
    </main>
  );
}
