import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './ProductDetail.css'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [lightbox, setLightbox]   = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      if (!data) setNotFound(true)
      else setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  if (loading) return <div className="detail-loading container">Loading…</div>
  if (notFound) return (
    <div className="detail-notfound container">
      <p>Product not found.</p>
      <Link to="/shop">← Back to shop</Link>
    </div>
  )

  const waMessage = encodeURIComponent(
    `Hi! I'm interested in: ${product.name} — PKR ${product.price}\nProduct link: ${window.location.href}`
  )
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMessage}`
  const images = (product.image_urls && product.image_urls.length > 0)
    ? product.image_urls
    : product.image_url
      ? [product.image_url]
      : ['/placeholder.png']

  return (
    <div className="detail container">
      <Link to="/shop" className="detail__back">← Back to shop</Link>

      <div className="detail__grid">
        {/* ── Image gallery ─────────────────────────────────── */}
        <div className="detail__gallery">
          <div className="detail__image-wrap" onClick={() => setLightbox(true)}>
            <img
              src={images[activeImg] || '/placeholder.png'}
              alt={product.name}
              className="detail__image"
            />
            <span className="detail__category">{product.category}</span>
            <span className="detail__zoom-hint">🔍 Click to enlarge</span>
          </div>
          {images.length > 1 && (
            <div className="detail__thumbs">
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`View ${i + 1}`}
                  className={`detail__thumb ${i === activeImg ? 'detail__thumb--active' : ''}`}
                  onClick={() => setActiveImg(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Lightbox ──────────────────────────────────────── */}
        {lightbox && (
          <div className="lightbox" onClick={() => setLightbox(false)}>
            <button className="lightbox__close" onClick={() => setLightbox(false)}>✕</button>
            {images.length > 1 && (
              <button
                className="lightbox__prev"
                onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + images.length) % images.length) }}
              >‹</button>
            )}
            <img
              src={images[activeImg]}
              alt={product.name}
              className="lightbox__img"
              onClick={e => e.stopPropagation()}
            />
            {images.length > 1 && (
              <button
                className="lightbox__next"
                onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % images.length) }}
              >›</button>
            )}
            <p className="lightbox__counter">{activeImg + 1} / {images.length}</p>
          </div>
        )}

        {/* ── Info ──────────────────────────────────────────── */}
        <div className="detail__info">
          <h1 className="detail__name">{product.name}</h1>
          <p className="detail__price">PKR {Number(product.price).toLocaleString()}</p>

          {product.description && (
            <div className="detail__desc">
              <p>{product.description}</p>
            </div>
          )}

          {product.condition && (
            <div className="detail__meta">
              <span className="meta-label">Condition</span>
              <span className="meta-value">{product.condition}</span>
            </div>
          )}

          {product.sold_out ? (
            <span className="detail__wa-btn detail__wa-btn--disabled">
              <WhatsAppIcon />
              Sold Out
            </span>
          ) : (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="detail__wa-btn"
            >
              <WhatsAppIcon />
              Contact Seller on WhatsApp
            </a>
          )}

          <p className="detail__wa-note">
            Tap the button above to message the seller directly. No account needed.
          </p>
        </div>
      </div>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}