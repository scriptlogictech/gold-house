
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import "./ProductDetails.css";

const products = [
  {
    id: "gold-001",
    name: "Classic Gold Earrings",
    category: "Gold",
    description:
      "Timeless jewellery inspiration for everyday elegance and meaningful occasions.",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85",
    ],
    note: "Ask our showroom team about this design.",
  },
  {
    id: "gold-002",
    name: "Traditional Gold Jewellery",
    category: "Gold",
    description:
      "Traditional-style jewellery inspiration for celebrations, gifting and special moments.",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85",
    ],
    note: "Ask our showroom team about this design.",
  },
  {
    id: "diamond-001",
    name: "Diamond-Inspired Earrings",
    category: "Diamond",
    description:
      "An elegant jewellery style to inspire your next special-occasion look.",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85",
    ],
    note: "Ask our showroom team about this design.",
  },
  {
    id: "diamond-002",
    name: "Statement Jewellery",
    category: "Diamond",
    description:
      "Statement-style jewellery inspiration for celebrations and memorable occasions.",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85",
    ],
    note: "Ask our showroom team about this design.",
  },
  {
    id: "silver-001",
    name: "Silver Accessories",
    category: "Silver",
    description:
      "Versatile silver-style jewellery inspiration for a variety of personal styles.",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85",
    ],
    note: "Ask our showroom team about this design.",
  },
  {
    id: "silver-002",
    name: "Everyday Silver Style",
    category: "Silver",
    description:
      "Simple jewellery inspiration for everyday outfits and thoughtful gifts.",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=85",
    ],
    note: "Ask our showroom team about this design.",
  },
  {
    id: "nkm-001",
    name: "Floral Gold Nosepin",
    category: "NKM Nosepins",
    brand: "NKM Nosepins",
    description:
      "A delicate floral-inspired nosepin style, presented as a temporary product example.",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85",
    ],
    note: "Ask Gold House DSS about NKM Nosepins availability.",
  },
  {
    id: "nkm-002",
    name: "Classic Gold Nose Stud",
    category: "NKM Nosepins",
    brand: "NKM Nosepins",
    description:
      "A subtle nose stud style, shown as temporary inspiration until official NKM photos are added.",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85",
    ],
    note: "Ask Gold House DSS about NKM Nosepins availability.",
  },
];

export default function ProductDetails() {
  const { id } = useParams();
  const product = products.find((item) => item.id === id);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <main className="pd-page">
        <section className="pd-not-found">
          <Sparkles size={30} />
          <span className="pd-eyebrow">GOLD HOUSE DSS</span>
          <h1>Design not found.</h1>
          <p>
            This design may have moved, or the link may be incorrect.
            Explore our collections to find another style.
          </p>
          <Link to="/collections" className="pd-primary-button">
            Browse collections <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    );
  }

  const images = product.gallery?.length
    ? product.gallery
    : [product.image];

  const selectedImage = images[activeImage] || product.image;

  const enquiryMessage = encodeURIComponent(
    `Hello Gold House DSS, I would like to enquire about "${product.name}" (${product.category}). Please share the available details and price.`
  );

  // Replace this placeholder with the showroom's confirmed WhatsApp number.
  const whatsappNumber = "";

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${enquiryMessage}`
    : null;

  return (
    <main className="pd-page">
      <header className="pd-header">
        <Link to="/collections" className="pd-back-link">
          <ArrowLeft size={16} />
          Back to collections
        </Link>

        <Link to="/" className="pd-brand">
          GOLD HOUSE DSS
        </Link>

        <span className="pd-header-note">DALSINGHSARAI</span>
      </header>

      <nav className="pd-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/collections">Collections</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <section className="pd-product-layout">
        <div className="pd-gallery">
          <div className="pd-main-image">
            <img src={selectedImage} alt={product.name} />

            <span className="pd-image-label">
              {product.brand || "GOLD HOUSE DSS"}
            </span>
          </div>

          <div className="pd-thumbnails" aria-label="Product images">
            {images.map((image, index) => (
              <button
                type="button"
                key={`${product.id}-${index}`}
                className={
                  activeImage === index
                    ? "pd-thumbnail active"
                    : "pd-thumbnail"
                }
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1}`}
                aria-pressed={activeImage === index}
              >
                <img src={image} alt="" loading="lazy" />
              </button>
            ))}
          </div>

          <p className="pd-image-disclaimer">
            Illustrative sample images. Actual product appearance may differ.
          </p>
        </div>

        <div className="pd-product-info">
          <div className="pd-product-category">
            <span />
            {product.category.toUpperCase()}
          </div>

          {product.brand && (
            <span className="pd-brand-badge">
              In association with {product.brand}
            </span>
          )}

          <h1>{product.name}</h1>

          <p className="pd-product-description">
            {product.description}
          </p>

          <div className="pd-info-divider" />

          <div className="pd-detail-row">
            <Sparkles size={18} />
            <div>
              <strong>Design details</strong>
              <p>
                Contact our showroom team to confirm the actual design,
                material, specifications and availability.
              </p>
            </div>
          </div>

          <div className="pd-detail-row">
            <ShieldCheck size={18} />
            <div>
              <strong>Product information</strong>
              <p>
                Price, purity, weight and other specifications have not
                been verified for this sample listing.
              </p>
            </div>
          </div>

          <div className="pd-info-divider" />

          <p className="pd-product-note">{product.note}</p>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="pd-primary-button"
            >
              <MessageCircle size={18} />
              Enquire on WhatsApp
              <ArrowUpRight size={17} />
            </a>
          ) : (
            <Link to="/contact" className="pd-primary-button">
              Enquire about this design
              <ArrowUpRight size={17} />
            </Link>
          )}

          <Link to="/collections" className="pd-secondary-button">
            <ArrowLeft size={15} />
            Continue browsing
          </Link>

          <div className="pd-assurance">
            <Check size={15} />
            <span>No online checkout — enquire directly with the showroom.</span>
          </div>
        </div>
      </section>

      <section className="pd-bottom-banner">
        <span className="pd-eyebrow">A LITTLE HELP GOES A LONG WAY</span>
        <h2>
          Let’s find something <em>you love.</em>
        </h2>
        <p>
          Our team can help answer your questions about designs and
          showroom availability.
        </p>
        <Link to="/contact" className="pd-text-link">
          Contact Gold House DSS <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="pd-footer">
        <Link to="/" className="pd-brand">
          GOLD HOUSE DSS
        </Link>
        <span>Jewellery for the moments that matter.</span>
        <Link to="/collections">Explore collections</Link>
      </footer>
    </main>
  );
}
