import { useEffect, useState } from 'react'
import { CartItem, Product } from '../types/Product'
import './PricingCalculator.css'
import { ACTIONS, useCartDispatch } from '../CartContext'
import Modal from './Modal'
import FormQuoteRequest from './FormQuoteRequest'
import { calculatePrice, formatPriceCLP, getDiscount } from '../libs'
import { useToast } from './ToastProvider'

interface PricingCalculatorProps {
  product: Product
}

const PricingCalculator = ({ product }: PricingCalculatorProps) => {
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedBreak, setSelectedBreak] = useState<number>(0)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const toast = useToast()

  const cartDispatch = useCartDispatch()

  /**
   * Bug de calculo 
   */
  useEffect(() => {
    if (!product.priceBreaks || product.priceBreaks.length === 0) {
      if (selectedBreak !== -1) setSelectedBreak(-1)
      return
    }
    
    let highest = -1
    for (let i = 0; i < product.priceBreaks.length; i++) {
      if (quantity >= product.priceBreaks[i].minQty) {
        highest = i
      }
    }

    // only update if different
    if (highest !== selectedBreak) {
      setSelectedBreak(highest)
    }
  }, [quantity, product.priceBreaks, selectedBreak])

  const currentPrice = calculatePrice(quantity, product)
  const discountPercent = getDiscount(quantity, product)

  const addToCart = () => {
    const unitPrice = calculatePrice(quantity, product) / Math.max(1, quantity);

    const newItem: CartItem = {
      ...product,
      quantity,
      selectedColor: "",
      selectedSize: "",
      unitPrice: unitPrice,
      totalPrice: Math.round(unitPrice * quantity * (1 - (discountPercent ?? 0) / 100)),
    }

    cartDispatch({type: ACTIONS.CART_INSERT_ITEM, payload: newItem})
    toast.success(`Agregado ${quantity} ${newItem.name} a tu carrito de compras.`)
  }

  return (
    <div className="pricing-calculator">
      <div className="calculator-header">
        <h3 className="calculator-title p1-medium">Calculadora de Precios</h3>
        <p className="calculator-subtitle l1">
          Calcula el precio según la cantidad que necesitas
        </p>
      </div>

      <div className="calculator-content">
        {/* Quantity Input */}
        <div className="quantity-section">
          <label className="quantity-label p1-medium">Cantidad</label>
          <div className="quantity-input-group">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="quantity-input p1"
              min="1"
              max={product.stock} //Bug de Validacion
              />
            <span className="quantity-unit l1">unidades</span>
          </div>
            {quantity == product.stock && // Bug de Validacion, visual validation for user that reach the limit.
            <span className="quantity-limit l1">Se a alcanzado el número máximo de disponibilidad para esta prenda</span>}
        </div>

        {/* Price Breaks */}
        {product.priceBreaks && product.priceBreaks.length > 0 && (
          <div className="price-breaks-section">
            <h4 className="breaks-title p1-medium">Descuentos por volumen</h4>
            <div className="price-breaks">
              {product.priceBreaks.map((priceBreak, index) => {
                const isActive = quantity >= priceBreak.minQty
                const isSelected = selectedBreak === index
                
                return (
                  <div 
                    key={index}
                    className={`price-break ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedBreak(index)
                      setQuantity(priceBreak.minQty)
                    }}
                  >
                    <div className="break-quantity l1">
                      {priceBreak.minQty}+ unidades
                    </div>
                    <div className="break-price p1-medium">
                      {formatPriceCLP(priceBreak.price)}
                    </div>
                    {priceBreak.discount && (
                      <div className="break-discount l1">
                        -{priceBreak.discount}%
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div className="price-summary">
          <div className="summary-row">
            <span className="summary-label p1">Precio unitario:</span>
            <span className="summary-value p1-medium">
              {formatPriceCLP(calculatePrice(quantity, product) / quantity)}
            </span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label p1">Cantidad:</span>
            <span className="summary-value p1-medium">{quantity} unidades</span>
          </div>

          {discountPercent > 0 && (
            <div className="summary-row discount-row">
              <span className="summary-label p1">Descuento:</span>
              <span className="summary-value discount-value p1-medium">
                -{discountPercent.toFixed(1)}%
              </span>
            </div>
          )}

          <div className="summary-row total-row">
            <span className="summary-label p1-medium">Total:</span>
            <span className="summary-value total-value h2">
              {formatPriceCLP(currentPrice)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="calculator-actions">

          <Modal open={openModal} onClose={() => setOpenModal(false)} title='Solicita Cotización oficial'>
            <FormQuoteRequest/>
          </Modal>

          <button 
            className="btn btn-secondary cta1"
            onClick={() => {
              setOpenModal(true)
              // Handle quote request
              // alert(`Cotización solicitada para ${quantity} unidades de ${product.name}`)
            }}
          >
            <span className="material-icons">email</span>
            Solicitar cotización oficial
          </button>
          
          <button 
            className="btn btn-primary cta1"
            onClick={() => {
              // Add to cart functionality
              addToCart()
            }}
          >
            <span className="material-icons">shopping_cart</span>
            Agregar al carrito
          </button>
        </div>

        {/* Additional Info */}
        <div className="additional-info">
          <div className="info-item">
            <span className="material-icons">local_shipping</span>
            <div className="info-content">
              <span className="info-title l1">Envío gratis</span>
              <span className="info-detail l1">En pedidos sobre $50.000</span>
            </div>
          </div>
          
          <div className="info-item">
            <span className="material-icons">schedule</span>
            <div className="info-content">
              <span className="info-title l1">Tiempo de producción</span>
              <span className="info-detail l1">7-10 días hábiles</span>
            </div>
          </div>
          
          <div className="info-item">
            <span className="material-icons">verified</span>
            <div className="info-content">
              <span className="info-title l1">Garantía</span>
              <span className="info-detail l1">30 días de garantía</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingCalculator