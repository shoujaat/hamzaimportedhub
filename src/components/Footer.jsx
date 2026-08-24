import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__brand">Hamza Imported Hub</p>
        <p className="footer__tagline">Quality imported goods — Karachi, Pakistan</p>
        <p className="footer__copy">© {new Date().getFullYear()} Hamza Imported Hub. All rights reserved.</p>
      </div>
    </footer>
  )
}
