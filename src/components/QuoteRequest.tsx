import { CART_ACTIONS, useCartDispatch } from "../CartContext"
import { buildQuoteSummary, calculatePrice, canAddToCart, downloadJSON, formatPriceCLP, getDiscount } from "../libs"
import { CartItem, QuoteRequestInterface } from "../types/Product"
import { useToast } from "./ToastProvider"

/**
 *  Cotizacion automatica, que tiene botones para agregar al carro y para exportar como json.
 *  El contenido ademas aplica las ofertas y porcentajes de descuento de el producto seleccionado 
 * si este sobrepasa el "threshold" minimo asigando en priceBreaks
 *  Ademas tiene un boton para exportar como json.
 */

const QuoteRequest = ({quantity, product, onClose}:QuoteRequestInterface) => {

  const cartDispatch = useCartDispatch()
  const toast = useToast()

  const discountPercent = getDiscount(quantity, product)
  const unitPrice = calculatePrice(quantity, product) / Math.max(1, quantity);
  const totalPrice = Math.round(unitPrice * Math.max(1, quantity))

  const addToCart = () => {

    const newItem: CartItem = {
      ...product,
      quantity,
      selectedColor: "",
      selectedSize: "",
      unitPrice: unitPrice,
      totalPrice: Math.round(unitPrice * quantity),
    }
    toast.success(`Agregado ${quantity} ${newItem.name} a tu carrito de compras.`)
    cartDispatch({type: CART_ACTIONS.INSERT, payload: newItem})
  }


  return (
    <div>
      <p>Para el producto <b>{product.name}</b></p>
      <p>Y en una cantidad de <b>{quantity}</b></p>
      <p>
        Precio unitario:{' '}
        <strong>{formatPriceCLP(unitPrice)}</strong>
        {discountPercent > 0 && (
          <> (−{discountPercent.toFixed(1)}% vs. base)</>
        )}
      </p>

      <h2>Total: {formatPriceCLP(totalPrice)}</h2>
      <button 
        className={`btn btn-primary cta1 ${!canAddToCart(product) ? 'disabled' : ''}`}
        disabled={!canAddToCart(product)}
        onClick={() => {
          addToCart()
          if(onClose) onClose()
        }}
      >
        <span className="material-icons">shopping_cart</span>
        {canAddToCart(product) ? 'Agregar al carrito' : 'No disponible'}
      </button>

      <button 
        className={`btn btn-secondary cta1 ${!canAddToCart(product) ? 'disabled' : ''}`}
        disabled={!canAddToCart(product)}
        onClick={() => {
          const quoteSumary = buildQuoteSummary(product,quantity)
          downloadJSON(quoteSumary)
        }}
      >
        <span className="material-symbols-outlined">
          file_export
        </span>
        Exportar como JSON
      </button>
    </div>
  )
}

export default QuoteRequest