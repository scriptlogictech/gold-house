
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";

import "./Contact.css";

const PHONE_DISPLAY = "097087 64000";
const PHONE_NUMBER = "919708764000";

const WHATSAPP_URL = `https://wa.me/${PHONE_NUMBER}`;

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Gold+House+Main+Bazar+Dalsinghsarai+Bihar+848114";

const initialForm = {
  name: "",
  phone: "",
  subject: "Product enquiry",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Please enter your name.";
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      nextErrors.phone =
        "Enter a valid 10-digit Indian mobile number.";
    }

    if (!form.message.trim()) {
      nextErrors.message = "Please enter your enquiry.";
    }

    setErrors(nextErrors);
    setSubmitted(false);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const whatsappMessage = [
      "Hello Gold House DSS!",
      "",
      "I would like to make an enquiry.",
      "",
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Enquiry: ${form.subject}`,
      `Message: ${form.message.trim()}`,
      "",
      "Thank you.",
    ].join("\n");

    const whatsappUrl =
      `${WHATSAPP_URL}?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );

    setSubmitted(true);
  };

  return (
    <main className="gh-contact-page">
      {/* HEADER */}
      <header className="gh-contact-header">
        <Link to="/" className="gh-contact-back">
          <ArrowLeft size={16} />
          Back to homepage
        </Link>

        <Link to="/" className="gh-contact-brand">
          GOLD HOUSE DSS
        </Link>

        <span className="gh-contact-location-label">
          DALSINGHSARAI · BIHAR
        </span>
      </header>

      {/* HERO SECTION */}
      <section className="gh-contact-hero">
        <div className="gh-contact-hero-copy">
          <span className="gh-contact-eyebrow">
            <span />
            WE WOULD LOVE TO HEAR FROM YOU
          </span>

          <h1>
            Let's make it
            <br />
            <em>personal.</em>
          </h1>

          <p>
            Have a question about a jewellery design, the NKM
            Nosepins collection, or a showroom visit? Send us
            your enquiry.
          </p>

          <a
            href="#contact-form"
            className="gh-contact-hero-link"
          >
            Send an enquiry <ArrowRight size={17} />
          </a>
        </div>

        <div className="gh-contact-hero-visual">
          <img
            src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85"
            alt="Jewellery styling inspiration"
          />

          <div className="gh-contact-visual-note">
            <Sparkles size={17} />
            <span>YOUR STORY. YOUR SPARKLE.</span>
          </div>
        </div>
      </section>

      {/* CONTACT INFORMATION AND FORM */}
      <section className="gh-contact-main">
        <div className="gh-contact-info">
          <span className="gh-contact-eyebrow">
            <span />
            VISIT OR CONTACT US
          </span>

          <h2>
            A little conversation
            <br />
            <em>goes a long way.</em>
          </h2>

          <p className="gh-contact-intro">
            Visit our showroom in Dalsinghsarai or send an
            enquiry about jewellery styles and availability.
          </p>

          {/* ADDRESS */}
          <div className="gh-contact-detail">
            <span className="gh-contact-detail-icon">
              <MapPin size={21} />
            </span>

            <div>
              <h3>Visit our showroom</h3>

              <p>
                Gold House DSS
                <br />
                Main Bazar
                <br />
                Dalsinghsarai, Bihar 848114
              </p>

              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="gh-contact-detail-link"
              >
                Get directions <ArrowUpRight size={15} />
              </a>
            </div>
          </div>

          {/* PHONE */}
          <div className="gh-contact-detail">
            <span className="gh-contact-detail-icon">
              <Phone size={21} />
            </span>

            <div>
              <h3>Call the showroom</h3>

              <p>{PHONE_DISPLAY}</p>

              <a
                href={`tel:+${PHONE_NUMBER}`}
                className="gh-contact-detail-link"
              >
                Call Gold House <Phone size={15} />
              </a>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="gh-contact-detail-link"
              >
                WhatsApp us <MessageCircle size={15} />
              </a>
            </div>
          </div>

          {/* SHOWROOM HOURS */}
          <div className="gh-contact-detail">
            <span className="gh-contact-detail-icon">
              <Clock size={21} />
            </span>

            <div>
              <h3>Showroom hours</h3>

              <p>
                Please contact the showroom to confirm
                opening hours before planning your visit.
              </p>

              <span className="gh-contact-pending">
                Business hours to be confirmed
              </span>
            </div>
          </div>

          {/* COLLECTION NOTE */}
          <div className="gh-contact-partner-note">
            <Sparkles size={18} />

            <p>
              Interested in NKM Nosepins? Mention it in your
              enquiry so the team knows which collection you
              want to explore.
            </p>
          </div>
        </div>

        {/* ENQUIRY FORM */}
        <div
          className="gh-contact-form-panel"
          id="contact-form"
        >
          <div className="gh-contact-form-heading">
            <span className="gh-contact-eyebrow">
              YOUR MESSAGE
            </span>

            <h2>Send us an enquiry.</h2>

            <p>
              Fill in your details and tell us what you
              would like to know.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* NAME */}
            <div className="gh-contact-field">
              <label htmlFor="gh-name">
                Your name *
              </label>

              <input
                id="gh-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={updateField}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? "gh-name-error" : undefined
                }
              />

              {errors.name && (
                <span
                  className="gh-contact-error"
                  id="gh-name-error"
                >
                  {errors.name}
                </span>
              )}
            </div>

            {/* PHONE */}
            <div className="gh-contact-field">
              <label htmlFor="gh-phone">
                Mobile number *
              </label>

              <input
                id="gh-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(event) => {
                  const digits = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

                  setForm((previous) => ({
                    ...previous,
                    phone: digits,
                  }));

                  setErrors((previous) => ({
                    ...previous,
                    phone: "",
                  }));

                  setSubmitted(false);
                }}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={
                  errors.phone ? "gh-phone-error" : undefined
                }
              />

              {errors.phone && (
                <span
                  className="gh-contact-error"
                  id="gh-phone-error"
                >
                  {errors.phone}
                </span>
              )}
            </div>

            {/* SUBJECT */}
            <div className="gh-contact-field">
              <label htmlFor="gh-subject">
                What is your enquiry about?
              </label>

              <select
                id="gh-subject"
                name="subject"
                value={form.subject}
                onChange={updateField}
              >
                <option>Product enquiry</option>
                <option>Gold jewellery</option>
                <option>Diamond jewellery</option>
                <option>Silver jewellery</option>
                <option>NKM Nosepins</option>
                <option>Showroom visit</option>
                <option>Other question</option>
              </select>
            </div>

            {/* MESSAGE */}
            <div className="gh-contact-field">
              <label htmlFor="gh-message">
                Your message *
              </label>

              <textarea
                id="gh-message"
                name="message"
                rows={5}
                placeholder="Tell us which design or information you need..."
                value={form.message}
                onChange={updateField}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={
                  errors.message
                    ? "gh-message-error"
                    : undefined
                }
              />

              {errors.message && (
                <span
                  className="gh-contact-error"
                  id="gh-message-error"
                >
                  {errors.message}
                </span>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="gh-contact-submit"
            >
              Continue to WhatsApp
              <Send size={16} />
            </button>

            {/* SUCCESS NOTICE */}
            {submitted && (
              <div
                className="gh-contact-form-notice"
                role="status"
              >
                <MessageCircle size={18} />

                <div>
                  <strong>WhatsApp enquiry prepared.</strong>

                  <p>
                    Your enquiry details have been prepared
                    in WhatsApp. Please press Send there to
                    deliver your message to Gold House DSS.
                  </p>
                </div>
              </div>
            )}

            <p className="gh-contact-form-disclaimer">
              Fields marked * are required. Your enquiry
              will be delivered through WhatsApp after you
              confirm sending the message.
            </p>
          </form>
        </div>
      </section>

      {/* GOOGLE MAPS SECTION */}
      <section className="gh-contact-map-section">
        <div>
          <span className="gh-contact-eyebrow">
            <span />
            FIND YOUR WAY TO US
          </span>

          <h2>
            See you in
            <br />
            <em>Dalsinghsarai.</em>
          </h2>

          <p>
            Find Gold House DSS at Main Bazar,
            Dalsinghsarai, Bihar 848114.
          </p>

          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gh-contact-map-button"
          >
            Open Google Maps <ArrowUpRight size={17} />
          </a>
        </div>

        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="gh-contact-map-card"
          aria-label="Find Gold House DSS on Google Maps"
        >
          <div className="gh-contact-map-decoration">
            <span className="gh-map-road gh-map-road-one" />
            <span className="gh-map-road gh-map-road-two" />
            <span className="gh-map-road gh-map-road-three" />

            <span className="gh-map-block gh-map-block-one" />
            <span className="gh-map-block gh-map-block-two" />
            <span className="gh-map-block gh-map-block-three" />

            <span className="gh-map-pin">
              <MapPin size={25} />
            </span>
          </div>

          <span className="gh-contact-map-card-label">
            <MapPin size={16} />
            Main Bazar, Dalsinghsarai
            <ArrowUpRight size={15} />
          </span>
        </a>
      </section>

      {/* BOTTOM CTA */}
      <section className="gh-contact-bottom">
        <span className="gh-contact-eyebrow">
          <span />
          GOLD HOUSE DSS
        </span>

        <h2>
          Jewellery for the moments
          <br />
          <em>that matter.</em>
        </h2>

        <Link
          to="/collections"
          className="gh-contact-bottom-link"
        >
          Explore our collections <ArrowRight size={16} />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="gh-contact-footer">
        <Link to="/" className="gh-contact-footer-brand">
          GOLD HOUSE DSS
        </Link>

        <span>Jewellery for your moments.</span>

        <Link to="/collections">
          Collections
        </Link>
      </footer>
    </main>
  );
}
