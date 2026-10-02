import { useState } from 'react'
import {
  Sparkles,
  ArrowRight,
  Play,
  ScanFace,
  ShoppingBag,
} from 'lucide-react'

import './App.css'
import TryOnPanel from './components/TryOnPanel'
import { products } from './data/products'
import type { Product } from './data/products'
import woman from './assets/woman.jpg'

function App() {
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null)

  const openTryOn = (product: Product = products[0]) => {
    setSelectedProduct(product)
  }

  const closeTryOn = () => {
    setSelectedProduct(null)
  }

  const scrollToHowItWorks = () => {
    document
      .getElementById('how-it-works')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
  }

  const productGroups = products.reduce<Record<string, Product[]>>(
    (groups, product) => {
      if (!groups[product.category]) {
        groups[product.category] = []
      }

      groups[product.category].push(product)

      return groups
    },
    {},
  )

  return (
    <main className="app">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar" aria-label="Main navigation">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Sparkles size={18} />
          </div>

          <span>TRYORA</span>
          <small>AI</small>
        </div>

        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#products">Products</a>
          <a href="#technology">Technology</a>
        </div>

        <button
          type="button"
          className="nav-button"
          onClick={() => openTryOn()}
        >
          Try it now
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </nav>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero-section">
        <div className="hero-content">

          <div className="eyebrow">
            <span className="status-dot" />
            AI-POWERED VIRTUAL TRY-ON
          </div>

          <h1>
            See it.
            <br />
            <span>Try it.</span>
            <br />
            Love it.
          </h1>

          <p className="hero-description">
            Experience products before you buy them with AI-powered
            virtual try-on. Discover your perfect look with a single
            photo.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => openTryOn()}
            >
              <ScanFace size={19} aria-hidden="true" />
              Start virtual try-on
              <ArrowRight size={17} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={scrollToHowItWorks}
            >
              <Play size={16} aria-hidden="true" />
              See how it works
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <strong>AI</strong>
              <span>Powered</span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>1</strong>
              <span>Photo needed</span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>∞</strong>
              <span>Looks to explore</span>
            </div>
          </div>
        </div>


        {/* =====================================================
            HERO VISUAL
        ===================================================== */}

        <div className="hero-visual">
          <div className="visual-glow" />

          <div className="image-frame">

            <div className="frame-top">
              <span>TRYORA / VIRTUAL MIRROR</span>

              <span className="live">
                <i />
                LIVE
              </span>
            </div>

            <div className="model-placeholder">
              <div className="portrait-ring">
                <div className="portrait-placeholder hero-woman">
                  <img
                    src={woman}
                    alt="Tryora Beauty virtual try-on model"
                  />
                </div>
              </div>
            </div>

            <div className="frame-bottom">
              <div>
                <span className="label">AI PREVIEW</span>
                <strong>Ready to transform</strong>
              </div>

              <button
                type="button"
                aria-label="Start virtual try-on"
                onClick={() => openTryOn()}
              >
                <ArrowRight size={20} aria-hidden="true" />
              </button>
            </div>
          </div>


          {/* PRODUCT FLOATING CARD */}

          <div className="floating-card product-card">
            <div className="floating-icon">
              <ShoppingBag
                size={17}
                aria-hidden="true"
              />
            </div>

            <div>
              <span>PRODUCT</span>
              <strong>Choose your look</strong>
            </div>
          </div>


          {/* AI FLOATING CARD */}

          <div className="floating-card ai-card">
            <Sparkles
              size={17}
              aria-hidden="true"
            />

            <div>
              <span>AI ANALYSIS</span>
              <strong>Personalized for you</strong>
            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          TRUST
      ===================================================== */}

      <section className="trust-section">
        <span>
          POWERED FOR THE NEXT GENERATION OF SHOPPING
        </span>

        <div className="trust-items">
          <div>
            <Sparkles size={16} aria-hidden="true" />
            <span>AI BEAUTY</span>
          </div>

          <div>
            <ScanFace size={16} aria-hidden="true" />
            <span>VIRTUAL TRY-ON</span>
          </div>

          <div>
            <ShoppingBag size={16} aria-hidden="true" />
            <span>SMART COMMERCE</span>
          </div>
        </div>
      </section>


      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <section
        id="products"
        className="products-section"
      >
        <div className="section-heading">
          <div>
            <span>EXPLORE THE COLLECTION</span>
            <h2>Find your next look.</h2>
          </div>

          <p>
            Choose a product and see how it looks on you before
            making a purchase.
          </p>
        </div>


        {/* =====================================================
            PRODUCT GROUPS
        ===================================================== */}

        <div className="product-groups">
          {Object.entries(productGroups).map(
            ([category, categoryProducts]) => (
              <div
                className="product-group"
                key={category}
              >
                <div className="product-group-heading">
                  <span>COLLECTION</span>
                  <h3>{category}</h3>
                </div>

                <div className="products-grid">
                  {categoryProducts.map((product) => (
                    <article
                      className="product-tile"
                      key={product.id}
                    >
                      <div className="product-image">
                        <img
                          src={product.image}
                          alt={`${product.name} by ${product.brand}`}
                        />

                        <button
                          type="button"
                          aria-label={`Try on ${product.name}`}
                          onClick={() =>
                            openTryOn(product)
                          }
                        >
                          <ScanFace
                            size={16}
                            aria-hidden="true"
                          />
                          Try on
                        </button>
                      </div>

                      <div className="product-meta">
                        <div>
                          <span>{product.brand}</span>
                          <h3>{product.name}</h3>
                        </div>

                        <strong>{product.price}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how-it-works"
        className="how-section"
      >
        <span className="section-kicker">
          HOW IT WORKS
        </span>

        <h2>
          Shopping should feel
          <br />
          <em>personal.</em>
        </h2>

        <div className="how-grid">

          <div>
            <b>01</b>
            <Sparkles size={21} aria-hidden="true" />

            <h3>Upload</h3>

            <p>
              Give Tryora a clear photo of yourself.
            </p>
          </div>

          <div>
            <b>02</b>
            <ScanFace size={21} aria-hidden="true" />

            <h3>Analyze</h3>

            <p>
              AI processes your image and selected product.
            </p>
          </div>

          <div>
            <b>03</b>
            <ShoppingBag
              size={21}
              aria-hidden="true"
            />

            <h3>Discover</h3>

            <p>
              See your personalized result before you shop.
            </p>
          </div>

        </div>
      </section>


      {/* =====================================================
          TECHNOLOGY
      ===================================================== */}

      <section
        id="technology"
        className="technology-section"
      >
        <div className="technology-content">

          <span className="section-kicker">
            THE TECHNOLOGY
          </span>

          <h2>
            Beauty meets
            <br />
            <em>intelligence.</em>
          </h2>

          <p>
            Tryora combines AI-powered image technology with a
            modern shopping experience to help customers explore
            products virtually before making a purchase.
          </p>

          <div className="technology-points">

            <div>
              <Sparkles size={18} aria-hidden="true" />

              <div>
                <strong>
                  AI-powered visualization
                </strong>

                <span>
                  Experience products through an intelligent
                  virtual preview.
                </span>
              </div>
            </div>

            <div>
              <ScanFace size={18} aria-hidden="true" />

              <div>
                <strong>
                  Personalized experience
                </strong>

                <span>
                  Your uploaded photo becomes the foundation of
                  your virtual experience.
                </span>
              </div>
            </div>

            <div>
              <ShoppingBag
                size={18}
                aria-hidden="true"
              />

              <div>
                <strong>
                  Built for commerce
                </strong>

                <span>
                  Connect discovery, visualization, and shopping
                  in one experience.
                </span>
              </div>
            </div>

          </div>
        </div>


        {/* TECHNOLOGY VISUAL */}

        <div className="technology-visual">
          <div className="technology-orbit">

            <div className="orbit-line orbit-one" />
            <div className="orbit-line orbit-two" />

            <div className="technology-center">
              <Sparkles
                size={34}
                aria-hidden="true"
              />

              <span>TRYORA</span>
              <small>AI ENGINE</small>
            </div>

          </div>
        </div>
      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer>
        <div className="brand">
          <div
            className="brand-mark"
            aria-hidden="true"
          >
            <Sparkles size={18} />
          </div>

          <span>TRYORA</span>
          <small>AI</small>
        </div>

        <span>
          AI-POWERED SHOPPING EXPERIENCE
        </span>
      </footer>


      {/* =====================================================
          VIRTUAL TRY-ON MODAL
      ===================================================== */}

      {selectedProduct && (
        <TryOnPanel
          product={selectedProduct}
          onClose={closeTryOn}
        />
      )}

    </main>
  )
}

export default App