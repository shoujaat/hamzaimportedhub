import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import './Home.css'

const CATEGORIES = ['Sports Goods', 'Chromebooks', 'Shoes']

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8)
      setFeatured(data || [])
      setLoading(false)
    }
    fetchFeatured()
  }, [])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <p className="hero__eyebrow">Karachi's trusted imported goods store</p>
            <h1 className="hero__headline">
              Quality you can<br />
              <em>trust. Prices</em> you'll love.
            </h1>
            <p className="hero__sub">
              Sports equipment, Chromebooks, and shoes — imported and sold directly.
              No middlemen. Contact seller instantly on WhatsApp.
            </p>
            <Link to="/shop" className="hero__cta">Browse All Products</Link>
          </div>
          <div className="hero__badges">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/shop?category=${encodeURIComponent(cat)}`} className="hero__badge">
                {categoryIcon(cat)}
                <span>{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────── */}
      <section className="trust-bar">
        <div className="container trust-bar__inner">
          <div className="trust-bar__item">
            <span className="trust-bar__icon">📦</span>
            <span>Imported directly</span>
          </div>
          <div className="trust-bar__item">
            <span className="trust-bar__icon">💬</span>
            <span>WhatsApp seller instantly</span>
          </div>
          <div className="trust-bar__item">
            <span className="trust-bar__icon">✅</span>
            <span>Hundreds of products</span>
          </div>
          <div className="trust-bar__item">
            <span className="trust-bar__icon">📍</span>
            <span>Based in Karachi</span>
          </div>
        </div>
      </section>

      {/* ── Featured products ─────────────────────────────────── */}
      <section className="featured">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Latest Arrivals</h2>
            <Link to="/shop" className="section-link">View all →</Link>
          </div>
          {loading ? (
            <div className="grid-skeleton">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : featured.length === 0 ? (
            <p className="empty-state">Products coming soon — check back shortly!</p>
          ) : (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function categoryIcon(cat) {
  const icons = { 'Sports Goods': '🏅', 'Chromebooks': '💻', 'Shoes': '👟' }
  return <span className="hero__badge-icon">{icons[cat] || '📦'}</span>
}
