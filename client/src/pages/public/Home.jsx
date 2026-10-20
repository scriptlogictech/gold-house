
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Menu,
  Search,
  X,
  MessageCircle,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Home.css";


import Heroimg from '/images/Hero.jpg'

const collections = [
  {
    number: "01",
    name: "Gold",
    description: "Made for your forever moments.",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=85",
    color: "orange",
  },
  {
    number: "02",
    name: "Diamond",
    description: "A little brilliance, every day.",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85",
    color: "blue",
  },
  {
    number: "03",
    name: "Silver",
    description: "Your style, your signature.",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1000&q=85",
    color: "red",
  },
  {
    number: "04",
    name: "NKM Nosepins",
    description: "Small details. Beautifully noticed.",
    // Temporary image: replace this URL with an official NKM product photo later.
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=85",
    color: "orange",
    badge: "NKM NOSEPINS",
  },
];

const designs = [
  {
    name: "The Everyday Edit",
    category: "GOLD JEWELLERY",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=85",
    number: "01",
  },
  {
    name: "Made to Celebrate",
    category: "STATEMENT JEWELLERY",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=85",
    number: "02",
  },
  {
    name: "The Little Details",
    category: "PENDANTS & ACCESSORIES",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=85",
    number: "03",
  },
];

const benefits = [
  {
    number: "01",
    title: "Find your kind of beautiful",
    text: "Explore designs for everyday wear, celebrations and life's most meaningful occasions.",
  },
  {
    number: "02",
    title: "Personal, not complicated",
    text: "Our showroom team can help you explore designs and answer your jewellery questions.",
  },
  {
    number: "03",
    title: "See it. Love it. Visit us.",
    text: "Discover a design online, then connect with us to learn more or visit the showroom.",
  },
];

function SectionLabel({ children, color = "orange" }) {
  return (
    <div className={`ed-label ed-label-${color}`}>
      <span className="ed-label-mark" />
      {children}
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredDesigns = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return designs;

    return designs.filter((item) =>
      `${item.name} ${item.category}`.toLowerCase().includes(query),
    );
  }, [search]);

  const closeMenu = () => setMenuOpen(false);

  const goToContact = () => {
    closeMenu();
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="ed-site">
      {/* Announcement */}
      <div className="ed-announcement">
        <Sparkles size={13} />
        <span>Good things are worth keeping forever.</span>
        <Sparkles size={13} />
      </div>

      {/* Navigation */}
      <header className="ed-header">
        <Link
          to="/"
          className="ed-logo-lockup"
          aria-label="Gold House DSS homepage"
          onClick={closeMenu}
        >
          <img
            src="/images/GH_logo_transparentx.png"
            alt="Gold House DSS logo"
            className="ed-logo"
          />
          {/* <span className="ed-logo-caption">
            <strong>GOLD HOUSE</strong>
            <small>DSS · JEWELLERY</small>
          </span> */}
        </Link>

        <nav className={`ed-nav ${menuOpen ? "ed-nav-open" : ""}`}>
          <a href="#collections" onClick={closeMenu}>
            Collections
          </a>
          <a href="#edit" onClick={closeMenu}>
            The Edit
          </a>
          <a href="#story" onClick={closeMenu}>
            Our Story
          </a>
          <a href="#contact" onClick={closeMenu}>
            Visit Us
          </a>
        </nav>

        <div className="ed-header-actions">
          <button
            type="button"
            className="ed-search-toggle"
            aria-label={searchOpen ? "Close search" : "Search designs"}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((previous) => !previous);
              if (!searchOpen) {
                setTimeout(() => {
                  document
                    .getElementById("design-search")
                    ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }, 0);
              } else {
                setSearch("");
              }
            }}
          >
            {searchOpen ? <X size={19} /> : <Search size={19} />}
          </button>

          <a href="#contact" className="ed-header-cta">
            Let's Talk <ArrowUpRight size={16} />
          </a>

          <button
            type="button"
            className="ed-menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((previous) => !previous)}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="ed-search-panel" id="design-search">
          <Search size={19} />
          <input
            type="search"
            placeholder="Search featured designs..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search featured designs"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")}>
              Clear
            </button>
          )}
        </div>
      )}

      <main>
        {/* Hero */}
        <section className="ed-hero" id="home">
          <div className="ed-hero-copy">
            <SectionLabel>JEWELLERY, WITH PERSONALITY</SectionLabel>

            <h1>
              GOLD HOUSE
              <br />
              <span className="ed-heading-accent"> Not just
              jewellery.</span>
              <br />
              <span className="ed-heading-italic">A little bit of you.</span>
            </h1>

            <p className="ed-hero-description">
              For the big celebrations, the little milestones and everything
              that makes your story yours. Find something that feels like you
              at Gold House DSS.
            </p>

            <div className="ed-hero-actions">
              <a href="#collections" className="ed-button ed-button-dark">
                Explore the collections <ArrowRight size={17} />
              </a>
              <a href="#story" className="ed-underlined-link">
                Get to know us <ArrowDownRight size={17} />
              </a>
            </div>

            <div className="ed-hero-footnote">
              <span className="ed-footnote-dot" />
              YOUR NEXT FAVOURITE PIECE IS WAITING
            </div>

            <span className="ed-hero-decoration" aria-hidden="true">
              GH.
            </span>
          </div>

          <div className="ed-hero-visual">
            <div className="ed-hero-photo">
              <img
                src={Heroimg}
                alt="Jewellery styling inspiration"
                fetchPriority="high"
              />
            </div>

            <div className="ed-photo-tag">
              <span>THE</span>
              <strong>NEW</strong>
              <span>CLASSICS</span>
            </div>

            <div className="ed-image-caption">
              <span>DESIGNS TO DISCOVER</span>
              <ArrowDownRight size={19} />
            </div>

            <div className="ed-hero-side-note">MADE FOR YOUR MOMENTS — GH DSS</div>
          </div>

          <a className="ed-scroll-cue" href="#collections" aria-label="Scroll to collections">
            <span>SCROLL A LITTLE</span>
            <ArrowDownRight size={16} />
          </a>
        </section>

        {/* Brand ticker */}
        <div className="ed-ticker" aria-label="Gold House DSS jewellery collections">
          <div className="ed-ticker-track">
            {Array.from({ length: 2 }, (_, copy) => (
              <div className="ed-ticker-group" key={copy}>
                <span>GOLD THAT GLOWS</span>
                <span className="ed-ticker-symbol">✳</span>
                <span>DIAMONDS THAT DAZZLE</span>
                <span className="ed-ticker-symbol">✳</span>
                <span>SILVER WITH SOUL</span>
                <span className="ed-ticker-symbol">✳</span>
                <span>YOUR STYLE. YOUR STORY.</span>
                <span className="ed-ticker-symbol">✳</span>
              </div>
            ))}
          </div>
        </div>

        {/* Collections */}
        <section className="ed-section ed-collections" id="collections">
          <div className="ed-section-heading">
            <div>
              <SectionLabel color="blue">A GOOD PLACE TO START</SectionLabel>
              <h2>
                Your style.
                <br />
                <span className="ed-heading-italic">Your collection.</span>
              </h2>
            </div>

            <p>
              From timeless gold and diamond designs to silver jewellery and NKM
              Nosepins, find a style that feels like you.
            </p>
          </div>

          <div className="ed-collection-grid">
            {collections.map((collection) => (
              <a
                href="#edit"
                className={`ed-collection-card ed-collection-${collection.color}`}
                key={collection.name}
              >
                <div className="ed-collection-photo">
                  <img
                    src={collection.image}
                    alt={`${collection.name} jewellery inspiration`}
                    loading="lazy"
                  />
                  {collection.badge && (
                    <span className="ed-collection-badge">
                      {collection.badge}
                    </span>
                  )}
                  <span className="ed-collection-number">
                    {collection.number}
                  </span>
                  <span className="ed-collection-arrow">
                    <ArrowUpRight size={22} />
                  </span>
                </div>

                <div className="ed-collection-copy">
                  <div>
                    <h3>{collection.name}</h3>
                    <p>{collection.description}</p>
                  </div>
                  <ArrowRight size={20} />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="ed-story" id="story">
          <div className="ed-story-visual">
            <img
              src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1100&q=85"
              alt="Jewellery details and styling inspiration"
              loading="lazy"
            />
            <div className="ed-story-sticker">
              <span>LOVE</span>
              <span>THE</span>
              <strong>DETAILS.</strong>
              <Sparkles size={20} />
            </div>
            <span className="ed-story-image-index">GH / 001</span>
          </div>

          <div className="ed-story-copy">
            <SectionLabel color="red">A LITTLE ABOUT US</SectionLabel>
            <h2>
              Some things
              <br />
              just <span className="ed-heading-italic">feel right.</span>
            </h2>

            <p>
              Jewellery is never just about what you wear. It can be a gift,
              a family tradition, a celebration or a little something you chose
              simply because you loved it.
            </p>

            <p>
              At Gold House DSS, discover jewellery inspiration, explore
              different styles and connect with our team to find a piece for
              your next special moment.
            </p>

            <a href="#contact" className="ed-button ed-button-outline">
              Come say hello <ArrowUpRight size={17} />
            </a>

            <span className="ed-story-signature">A little sparkle goes a long way.</span>
          </div>
        </section>

        {/* Featured designs */}
        <section className="ed-section ed-edit" id="edit">
          <div className="ed-section-heading ed-edit-heading">
            <div>
              <SectionLabel>THE GOLD HOUSE EDIT</SectionLabel>
              <h2>
                Currently on
                <br />
                <span className="ed-heading-italic">our moodboard.</span>
              </h2>
            </div>

            <p>
              A little inspiration for your next favourite piece. Ask our
              showroom team about designs, pricing and availability.
            </p>
          </div>

          {searchOpen && (
            <p className="ed-results-count" aria-live="polite">
              {filteredDesigns.length} featured design
              {filteredDesigns.length === 1 ? "" : "s"} found
            </p>
          )}

          <div className="ed-design-grid">
            {filteredDesigns.map((design) => (
              <article className="ed-design-card" key={design.number}>
                <div className="ed-design-photo">
                  <img
                    src={design.image}
                    alt={design.name}
                    loading="lazy"
                  />
                  <span className="ed-design-number">{design.number}</span>
                  <button
                    type="button"
                    className="ed-design-enquire"
                    onClick={goToContact}
                  >
                    Ask about this <ArrowUpRight size={16} />
                  </button>
                </div>

                <div className="ed-design-copy">
                  <span>{design.category}</span>
                  <h3>{design.name}</h3>
                  <a href="#contact">
                    Enquire with our team <ArrowRight size={15} />
                  </a>
                </div>
              </article>
            ))}

            {filteredDesigns.length === 0 && (
              <div className="ed-empty-search">
                <Search size={25} />
                <h3>Nothing here just yet.</h3>
                <p>Try another keyword to find a featured design.</p>
              </div>
            )}
          </div>

          <p className="ed-image-disclaimer">
            Images are illustrative inspiration, not a verified product
            catalogue. Please confirm actual designs and availability with
            Gold House DSS.
          </p>
        </section>

        {/* Experience */}
        <section className="ed-experience">
          <div className="ed-experience-top">
            <SectionLabel color="blue">THE GOOD STUFF</SectionLabel>
            <h2>
              Jewellery shopping,
              <br />
              <span className="ed-heading-italic">made more personal.</span>
            </h2>
          </div>

          <div className="ed-experience-grid">
            {benefits.map((benefit, index) => (
              <article className="ed-experience-card" key={benefit.number}>
                <span className="ed-experience-number">{benefit.number}</span>
                <div
                  className={`ed-experience-shape ed-experience-shape-${index + 1}`}
                >
                  {index === 0 ? (
                    <Sparkles size={27} />
                  ) : index === 1 ? (
                    <MessageCircle size={27} />
                  ) : (
                    <MapPin size={27} />
                  )}
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="ed-contact" id="contact">
          <div className="ed-contact-shape ed-contact-shape-one" />
          <div className="ed-contact-shape ed-contact-shape-two" />

          <div className="ed-contact-content">
            <SectionLabel color="blue">LET'S MAKE IT PERSONAL</SectionLabel>
            <h2>
              Found something
              <br />
              <span className="ed-heading-italic">you love?</span>
            </h2>
            <p>
              Tell us what caught your eye. Our team can help you with
              jewellery enquiries, availability and your showroom visit.
            </p>
            <div className="ed-contact-actions">
              <a className="ed-button ed-button-dark" href="mailto:">
                Contact Gold House <ArrowRight size={17} />
              </a>
              <a className="ed-contact-secondary" href="#collections">
                Keep exploring <ArrowDownRight size={17} />
              </a>
            </div>
            <span className="ed-contact-note">
              Showroom contact details will be added once confirmed.
            </span>
          </div>

          <span className="ed-contact-side-label">YOUR STORY, YOUR SPARKLE.</span>
        </section>
      </main>

      {/* Footer */}
      <footer className="ed-footer">
        <div className="ed-footer-main">
          <Link to="/" className="ed-logo-lockup ed-footer-brand">
            <img
              src="/images/GH_logo_transparentx.png"
              alt="Gold House DSS logo"
              className="ed-logo"
            />
            <span className="ed-logo-caption">
              <strong>GOLD HOUSE</strong>
              <small>DSS · JEWELLERY</small>
            </span>
          </Link>

          <p>
            Jewellery for the moments that matter.
            <br />
            And the ones that are just yours.
          </p>

          <div className="ed-footer-links">
            <a href="#collections">Collections</a>
            <a href="#edit">The Edit</a>
            <a href="#story">Our Story</a>
            <a href="#contact">Contact</a>
          </div>
        </div>

        <div className="ed-footer-bottom">
          <span>© {new Date().getFullYear()} Gold House DSS.</span>
          <span>MADE FOR YOUR MOMENTS.</span>
          <Link to="/admin/login">Staff Login <ArrowUpRight size={13} /></Link>
        </div>
      </footer>
    </div>
  );
}
