import { Link } from 'react-router-dom'
import './Header.css'
import { useCart } from '../CartContext'
import { useState } from 'react'
import Modal from './Modal'
import Cart from './Cart'

/**
 * 
 * El header se actualiza dentro del contexto del carrito 
 * No le agregue mucho, aparte de el propio modal del carrito 
 * 
 */

const Header = () => {

  const {countItems} = useCart()
  const [openModal, setOpenModal] = useState(false)

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">
              <span className="material-icons">store</span>
            </div>
            <span className="logo-text p1-medium">SWAG Challenge</span>
          </Link>

          {/* Navigation */}
          <nav className="nav">
            <Link to="/" className="nav-link l1">
              <span className="material-icons">home</span>
              Catálogo
            </Link>
            <Modal open={openModal} onClose={() => setOpenModal(false)} title='Carro de compras'>
              <Cart/>
            </Modal>
            <button className="nav-link l1" onClick={() => setOpenModal(true)}>
              <span className="material-icons">shopping_cart</span>
              Carrito ({countItems})
            </button>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <button className="btn btn-secondary cta1">
              <span className="material-icons">person</span>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header