
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Gem,
  Heart,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import "./About.css";

const values = [
  {
    icon: Gem,
    number: "01",
    title: "Thoughtful Selection",
    description:
      "Explore jewellery styles chosen for different tastes, occasions, and personal expressions.",
  },
  {
    icon: Heart,
    number: "02",
    title: "Made for Your Moments",
    description:
      "Discover designs for everyday elegance, celebrations, gifting, and meaningful milestones.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "A Personal Experience",
    description:
      "Tell us what you are looking for and connect with our team to explore suitable designs.",
  },
];

const collections = [
  {
    name: "Gold Jewellery",
    description: "Timeless designs for life's special moments.",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",
    link: "/collections",
  },
  {
    name: "Diamond Jewellery",
    description: "Elegant sparkle for memorable occasions.",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
    link: "/collections",
  },
  {
    name: "Silver Jewellery",
    description: "Versatile styles for your personal collection.",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85",
    link: "/collections",
  },
];

export default function About() {
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-eyebrow">
            <span />
            THE GOLD HOUSE DSS STORY
          </div>

          <h1>
            Jewellery that feels
            <span> personal.</span>
          </h1>

          <p className="about-hero-description">
            Every piece tells a story. Discover jewellery for your everyday
            style, your celebrations, and the moments you want to remember.
          </p>

          <div className="about-hero-actions">
            <Link to="/collections" className="about-btn about-btn-primary">
              Explore collections <ArrowRight size={17} />
            </Link>

            <Link to="/contact" className="about-text-link">
              Visit our store <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="about-hero-location">
            <MapPin size={17} />
            <span>Gudri Bazar, Dalsingsarai, Bihar</span>
          </div>
        </div>

        <div className="about-hero-visual">
          <div className="about-hero-image-wrap">
            <img
              src="/images/Hero.jpg"
              alt="Gold House DSS jewellery collection"
              className="about-hero-image"
            />
          </div>

          <div className="about-image-caption">
            <span className="about-caption-icon">
              <Gem size={19} />
            </span>
            <div>
              <span className="about-caption-label">YOUR STYLE, YOUR STORY</span>
              <p>Find a piece that feels like you.</p>
            </div>
          </div>

          <div className="about-hero-decoration" aria-hidden="true">
            <Sparkles size={28} />
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="about-intro">
        <div className="about-intro-label">
          <span className="about-section-kicker">A LITTLE ABOUT US</span>
          <span className="about-intro-line" />
        </div>

        <div className="about-intro-content">
          <h2>
            More than jewellery.
            <br />
            <span>A part of your story.</span>
          </h2>

          <div className="about-intro-copy">
            <p>
              At Gold House DSS, we believe jewellery is a personal choice.
              It can celebrate an occasion, complete an outfit, become a
              thoughtful gift, or simply make an ordinary day feel special.
            </p>

            <p>
              Our aim is to help you explore different styles and find designs
              that suit your preferences. From gold and diamond jewellery to
              silver pieces and NKM Nosepins, there is more to discover with
              every visit.
            </p>

            <Link to="/contact" className="about-inline-link">
              Get in touch with us <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="about-section-heading">
          <div>
            <span className="about-section-kicker">WHAT MATTERS TO US</span>
            <h2>A shopping experience centered on you.</h2>
          </div>

          <p>
            Your preferences, your occasion, and your individual style help
            guide the jewellery you choose.
          </p>
        </div>

        <div className="about-values-grid">
          {values.map((item) => {
            const Icon = item.icon;

            return (
              <article className="about-value-card" key={item.number}>
                <div className="about-value-top">
                  <span className="about-value-number">{item.number}</span>
                  <span className="about-value-icon">
                    <Icon size={23} strokeWidth={1.5} />
                  </span>
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="about-value-bottom-line" />
              </article>
            );
          })}
        </div>
      </section>

      {/* Collections */}
      <section className="about-collections">
        <div className="about-section-heading about-collections-heading">
          <div>
            <span className="about-section-kicker">EXPLORE OUR WORLD</span>
            <h2>Something for every style.</h2>
          </div>

          <Link to="/collections" className="about-inline-link">
            View all collections <ArrowRight size={16} />
          </Link>
        </div>

        <div className="about-collections-grid">
          {collections.map((item) => (
            <Link
              to={item.link}
              className="about-collection-card"
              key={item.name}
            >
              <div className="about-collection-image-wrap">
                <img src={item.image} alt={item.name} loading="lazy" />
                <span className="about-collection-arrow">
                  <ArrowUpRight size={19} />
                </span>
              </div>

              <div className="about-collection-info">
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
                <ArrowRight size={18} />
              </div>
            </Link>
          ))}
        </div>

        <div className="about-nkm-banner">
          <div className="about-nkm-icon">
            <Sparkles size={25} />
          </div>

          <div className="about-nkm-copy">
            <span>ALSO EXPLORE</span>
            <h3>NKM Nosepins</h3>
            <p>Discover nosepin designs as part of our jewellery selection.</p>
          </div>

          <Link to="/collections" className="about-nkm-link">
            Discover more <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Store visit */}
      <section className="about-visit">
        <div className="about-visit-image">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1100&q=85"
            alt="Elegant jewellery displayed for inspiration"
            loading="lazy"
          />
        </div>

        <div className="about-visit-content">
          <span className="about-section-kicker">WE WOULD LOVE TO SEE YOU</span>
          <h2>Let’s find your next favourite piece.</h2>
          <p>
            Visit Gold House DSS in Dalsingsarai or contact us with your
            jewellery preferences. We would be happy to help you take the
            next step.
          </p>

          <div className="about-visit-address">
            <span className="about-visit-address-icon">
              <MapPin size={20} />
            </span>
            <div>
              <strong>Gold House DSS</strong>
              <span>
                Gudri Bazar, Dalsingsarai,
                <br />
                Samastipur, Bihar, India
              </span>
            </div>
          </div>

          <div className="about-visit-actions">
            <Link to="/contact" className="about-btn about-btn-primary">
              Contact us <ArrowRight size={17} />
            </Link>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Gold+House+Gudri+Bazar+Dalsingsarai+Samastipur+Bihar"
              target="_blank"
              rel="noreferrer"
              className="about-btn about-btn-outline"
            >
              Get directions <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="about-final-cta">
        <div className="about-final-cta-decoration" aria-hidden="true">
          <Sparkles size={24} />
        </div>

        <span className="about-section-kicker">YOUR NEXT DISCOVERY AWAITS</span>
        <h2>Find jewellery that feels like you.</h2>
        <p>
          Explore our collections and discover designs for the moments that
          matter to you.
        </p>

        <div className="about-final-actions">
          <Link to="/collections" className="about-btn about-btn-light">
            Explore jewellery <ArrowRight size={17} />
          </Link>

          <Link to="/contact" className="about-final-contact">
            <MessageCircle size={17} />
            Talk to our team
          </Link>
        </div>
      </section>
    </main>
  );
}
