import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import './Shop.css'

const PAGE_SIZE = 24

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(0)

  const activeCategory = searchParams.get('category') || ''
  const searchQuery    = searchParams.get('q') || ''

  // Fetch available categories dynamically from DB
  useEffect(() => {
    supabase
      .from('products')
      .select('category')
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map(d => d.category))].filter(Boolean).sort()
          setCategories(unique)
        }
      })
  }, [])

  const fetchProducts = useCallback(async (reset = false) => {
    setLoading(true)
    const currentPage = reset ? 0 : page

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

    if (activeCategory) query = query.eq('category', activeCategory)
    if (searchQuery)    query = query.ilike('name', `%${searchQuery}%`)

    const { data, count } = await query
    if (reset) {
      setProducts(data || [])
      setPage(0)
    } else {
      setProducts(prev => [...prev, ...(data || [])])
    }
    setTotal(count || 0)
    setLoading(false)
  }, [activeCategory, searchQuery, page])

  // Reset and refetch when filters change
  useEffect(() => {
    fetchProducts(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, searchQuery])

  function handleSearch(e) {
    e.preventDefault()
    const q = e.target.elements.q.value.trim()
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (q) next.set('q', q); else next.delete('q')
      return next
    })
  }

  function setCategory(cat) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (cat) next.set('category', cat); else next.delete('category')
      next.delete('q')
      return next
    })
  }

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchProducts(false)
  }

  const hasMore = products.length < total

  return (
    <div className="shop">
      <div className="container">
        {/* ── Top bar ───────────────────────────────────────── */}
        <div className="shop__topbar">
          <h1 className="shop__title">All Products</h1>
          <form onSubmit={handleSearch} className="shop__search">
            <input
              name="q"
              defaultValue={searchQuery}
              placeholder="Search products…"
              className="shop__search-input"
            />
            <button type="submit" className="shop__search-btn">Search</button>
          </form>
        </div>

        <div className="shop__layout">
          {/* ── Sidebar ───────────────────────────────────── */}
          <aside className="shop__sidebar">
            <p className="sidebar__label">Category</p>
            <button
              className={`sidebar__option ${!activeCategory ? 'sidebar__option--active' : ''}`}
              onClick={() => setCategory('')}
            >
              All Products
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`sidebar__option ${activeCategory === cat ? 'sidebar__option--active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </aside>

          {/* ── Grid ──────────────────────────────────────── */}
          <div className="shop__content">
            <p className="shop__count">
              {loading ? 'Loading…' : `${total} product${total !== 1 ? 's' : ''} found`}
            </p>

            {!loading && products.length === 0 ? (
              <p className="empty-state">No products found. Try a different search or category.</p>
            ) : (
              <div className="products-grid">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
                {loading && [...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton-card" />
                ))}
              </div>
            )}

            {hasMore && !loading && (
              <div className="shop__load-more">
                <button className="load-more-btn" onClick={loadMore}>
                  Load more
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
