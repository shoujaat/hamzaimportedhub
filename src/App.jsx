import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import AdminUpload from './pages/AdminUpload'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/shop"        element={<Shop />} />
          <Route path="/shop/:id"    element={<ProductDetail />} />
          <Route path="/admin"       element={<AdminUpload />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
