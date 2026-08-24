import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-mark">H</span>
          Hamza Imported Hub
        </Link>

        <nav className={`navbar__links ${open ? 'navbar__links--open' : ''}`}>
          <NavLink to="/"     end onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/shop"     onClick={() => setOpen(false)}>Shop</NavLink>
        </nav>

        <button
          className="navbar__burger"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
