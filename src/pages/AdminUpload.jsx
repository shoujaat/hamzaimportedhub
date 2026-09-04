import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './AdminUpload.css'

const CLOUD_NAME     = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET  = 'hamzaimportedhub_products'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

const DEFAULT_CATEGORIES = ['Sports Goods', 'Chromebooks', 'Shoes']

export default function AdminUpload() {
  // ── Auth state ───────────────────────────────────────────
  const [authed, setAuthed]   = useState(false)
  const [attempt, setAttempt] = useState('')
  const [wrong, setWrong]     = useState(false)

  // ── Tab state ────────────────────────────────────────────
  const [tab, setTab] = useState('add') // 'add' | 'manage'

  // ── Category state ───────────────────────────────────────
  const [categories, setCategories]     = useState(DEFAULT_CATEGORIES)
  const [newCategory, setNewCategory]   = useState('')
  const [showCatInput, setShowCatInput] = useState(false)

  // ── Add form state ───────────────────────────────────────
  const [form, setForm] = useState({
    name: '', category: '', price: '', condition: '', description: '',
  })
  const [imageFiles, setImageFiles] = useState([])
  const [previews, setPreviews]     = useState([])
  const [status, setStatus]         = useState('')
  const [uploading, setUploading]   = useState(false)

  // ── Manage state ─────────────────────────────────────────
  const [products, setProducts]       = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [manageStatus, setManageStatus]       = useState({}) // { [id]: message }
  const [confirmDelete, setConfirmDelete]     = useState(null) // id to confirm

  // ── Password screen ──────────────────────────────────────
  if (!authed) {
    return (
      <div className="admin container">
        <h1 className="admin__title">Admin Access</h1>
        <div className="admin__form" style={{ maxWidth: 380 }}>
          <div className="form-group">
            <label htmlFor="pw">Password</label>
            <input
              id="pw"
              type="password"
              value={attempt}
              onChange={e => { setAttempt(e.target.value); setWrong(false) }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  attempt === ADMIN_PASSWORD ? setAuthed(true) : setWrong(true)
                }
              }}
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          {wrong && <p className="admin__status error">❌ Wrong password.</p>}
          <button
            className="admin__submit"
            onClick={() => attempt === ADMIN_PASSWORD ? setAuthed(true) : setWrong(true)}
          >
            Enter
          </button>
        </div>
      </div>
    )
  }

  // ── Fetch products for manage tab ────────────────────────
  async function fetchProducts() {
    setLoadingProducts(true)
    const { data } = await supabase
      .from('products')
      .select('id, name, category, price, image_url, image_urls, sold_out')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoadingProducts(false)
  }

  // ── Add product handlers ─────────────────────────────────
  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleAddCategory() {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    if (!categories.includes(trimmed)) {
      setCategories(c => [...c, trimmed])
    }
    setForm(f => ({ ...f, category: trimmed }))
    setNewCategory('')
    setShowCatInput(false)
  }

  function handleImage(e) {
    const files = Array.from(e.target.files).slice(0, 4)
    setImageFiles(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function uploadToCloudinary() {
    const urls = []
    for (const file of imageFiles) {
      const data = new FormData()
      data.append('file', file)
      data.append('upload_preset', UPLOAD_PRESET)
      const res  = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: data }
      )
      const json = await res.json()
      if (!json.secure_url) throw new Error('Cloudinary upload failed')
      urls.push(json.secure_url)
    }
    return urls
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.category || !form.price) {
      setStatus('Please fill in name, category, and price.')
      return
    }
    if (imageFiles.length === 0) {
      setStatus('Please select at least one image.')
      return
    }
    setUploading(true)
    setStatus(`Uploading ${imageFiles.length} image(s)…`)
    try {
      const imageUrls = await uploadToCloudinary()
      setStatus('Saving to database…')
      const { error } = await supabase.from('products').insert([{
        name:        form.name.trim(),
        category:    form.category.trim(),
        price:       parseFloat(form.price),
        condition:   form.condition.trim() || null,
        description: form.description.trim() || null,
        image_url:   imageUrls[0],
        image_urls:  imageUrls,
        sold_out:    false,
      }])
      if (error) throw error
      setStatus('✅ Product added successfully!')
      setForm({ name: '', category: '', price: '', condition: '', description: '' })
      setImageFiles([])
      setPreviews([])
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  // ── Manage handlers ──────────────────────────────────────
  async function toggleSoldOut(product) {
    const newVal = !product.sold_out
    setManageStatus(s => ({ ...s, [product.id]: 'Saving…' }))
    const { error } = await supabase
      .from('products')
      .update({ sold_out: newVal })
      .eq('id', product.id)
    if (error) {
      setManageStatus(s => ({ ...s, [product.id]: '❌ Failed' }))
    } else {
      setProducts(ps => ps.map(p => p.id === product.id ? { ...p, sold_out: newVal } : p))
      setManageStatus(s => ({ ...s, [product.id]: newVal ? '🔴 Marked sold out' : '✅ Back in stock' }))
      setTimeout(() => setManageStatus(s => { const n = { ...s }; delete n[product.id]; return n }), 2000)
    }
  }

  async function deleteProduct(id) {
    setManageStatus(s => ({ ...s, [id]: 'Deleting…' }))
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      setManageStatus(s => ({ ...s, [id]: '❌ Failed to delete' }))
    } else {
      setProducts(ps => ps.filter(p => p.id !== id))
    }
    setConfirmDelete(null)
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="admin container">
      <h1 className="admin__title">Admin Panel</h1>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div className="admin__tabs">
        <button
          className={`admin__tab ${tab === 'add' ? 'admin__tab--active' : ''}`}
          onClick={() => setTab('add')}
        >
          + Add Product
        </button>
        <button
          className={`admin__tab ${tab === 'manage' ? 'admin__tab--active' : ''}`}
          onClick={() => { setTab('manage'); fetchProducts() }}
        >
          Manage Products
        </button>
      </div>

      {/* ── ADD TAB ───────────────────────────────────────── */}
      {tab === 'add' && (
        <form className="admin__form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input id="name" name="name" value={form.name} onChange={handleChange}
              placeholder="e.g. Adidas Predator Football Boots" required />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">— Select a category —</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {!showCatInput ? (
              <button type="button" className="cat-add-btn" onClick={() => setShowCatInput(true)}>
                + Add custom category
              </button>
            ) : (
              <div className="cat-input-row">
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                  placeholder="e.g. Accessories"
                  autoFocus
                />
                <button type="button" className="cat-confirm-btn" onClick={handleAddCategory}>Add</button>
                <button type="button" className="cat-cancel-btn" onClick={() => { setShowCatInput(false); setNewCategory('') }}>✕</button>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (PKR) *</label>
              <input id="price" name="price" type="number" value={form.price}
                onChange={handleChange} placeholder="e.g. 15000" required min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="condition">Condition</label>
              <input id="condition" name="condition" value={form.condition}
                onChange={handleChange} placeholder="e.g. Brand New, Used - Good" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={form.description}
              onChange={handleChange} rows={4}
              placeholder="Describe the product — size, specs, colour, etc." />
          </div>

          <div className="form-group">
            <label htmlFor="image">Product Images * (up to 4)</label>
            <input id="image" type="file" accept="image/*" multiple onChange={handleImage} />
            {previews.length > 0 && (
              <div className="admin__previews">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt={`Preview ${i + 1}`} className="admin__preview" />
                ))}
              </div>
            )}
          </div>

          {status && (
            <p className={`admin__status ${status.startsWith('✅') ? 'success' : status.startsWith('❌') ? 'error' : ''}`}>
              {status}
            </p>
          )}

          <button type="submit" className="admin__submit" disabled={uploading}>
            {uploading ? 'Uploading…' : 'Add Product'}
          </button>
        </form>
      )}

      {/* ── MANAGE TAB ────────────────────────────────────── */}
      {tab === 'manage' && (
        <div className="manage">
          {loadingProducts ? (
            <p className="manage__loading">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="manage__empty">No products found.</p>
          ) : (
            <div className="manage__list">
              {products.map(p => (
                <div key={p.id} className={`manage__item ${p.sold_out ? 'manage__item--soldout' : ''}`}>
                  <img
                    src={(p.image_urls && p.image_urls[0]) || p.image_url || '/placeholder.png'}
                    alt={p.name}
                    className="manage__img"
                  />
                  <div className="manage__info">
                    <p className="manage__name">{p.name}</p>
                    <p className="manage__meta">{p.category} · PKR {Number(p.price).toLocaleString()}</p>
                    {p.sold_out && <span className="manage__sold-badge">SOLD OUT</span>}
                  </div>
                  <div className="manage__actions">
                    {manageStatus[p.id] && (
                      <span className="manage__action-status">{manageStatus[p.id]}</span>
                    )}
                    <button
                      className={`manage__btn manage__btn--soldout ${p.sold_out ? 'manage__btn--restock' : ''}`}
                      onClick={() => toggleSoldOut(p)}
                    >
                      {p.sold_out ? '✅ Mark In Stock' : '🔴 Mark Sold Out'}
                    </button>

                    {confirmDelete === p.id ? (
                      <div className="manage__confirm">
                        <span>Are you sure?</span>
                        <button className="manage__btn manage__btn--delete-confirm" onClick={() => deleteProduct(p.id)}>Yes, Delete</button>
                        <button className="manage__btn manage__btn--cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button
                        className="manage__btn manage__btn--delete"
                        onClick={() => setConfirmDelete(p.id)}
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
