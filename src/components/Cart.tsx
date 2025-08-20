import { useCallback, useEffect, useState } from "react"
import { formatPriceCLP } from "../libs"
import { CartItem } from "../types/Product"
import { CART_KEY, loadCart, saveCart } from "../Storage"
import "./Cart.css"
import { useCart } from "../CartContext"

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>(() => loadCart())

  const cartContext = useCart()

  // Persist whenever items change
  useEffect(() => { saveCart(items) }, [items])

  // Cross-tab sync + in-tab external updates
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) setItems(loadCart())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  if (!items.length) {
    return (
      <section className="cart">
        <h2>Tu carrito</h2>
        <p>No hay productos en el carrito.</p>
      </section>
    )
  }

  return (
    <section className="cart">
      <header className="cart__header">
        <div>
          <h2>Tus productos ({cartContext.countItems})</h2>
          <h4>Actualmente tienes {cartContext.countAllItems} en tu carro</h4>
        </div>
        <button className="btn btn-primary cta2" onClick={clearCart}>Vaciar carrito</button>
      </header>

      <ul className="cart__list">
        {items.map(item => {
          const qty = Math.max(1, item.quantity ?? 1)
          const lineTotal = Math.round(item.totalPrice ?? item.unitPrice * qty)
          const hasDiscount = item.unitPrice < item.basePrice
          const discountPct = hasDiscount
            ? Math.max(0, Math.round((1 - item.unitPrice / item.basePrice) * 100))
            : 0

          return (
            <li key={item.id} className="cart__row">
              <div className="cart__media">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="cart__placeholder" aria-hidden="true" />
                )}
              </div>

              <div className="cart__info">
                <h3 className="cart__name">{item.name}</h3>
                <div className="cart__meta">
                  <span>SKU: {item.sku}</span>
                  {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                  {item.selectedSize && <span>Talla: {item.selectedSize}</span>}
                  <span>Cantidad: {qty}</span>
                </div>

                <div className="cart__prices">
                  <div className="cart__unit">
                    {hasDiscount ? (
                      <>
                        <span className="cart__unit--strike">{formatPriceCLP(item.basePrice)}</span>
                        <span className="cart__unit--now">{formatPriceCLP(item.unitPrice)}</span>
                        <span className="cart__badge">- {discountPct}%</span>
                      </>
                    ) : (
                      <span className="cart__unit--now">{formatPriceCLP(item.unitPrice)}</span>
                    )}
                    <span className="cart__x"> × {qty}</span>
                  </div>
                  <div className="cart__line-total">{formatPriceCLP(lineTotal)}</div>
                </div>

                <div className="cart__actions">
                  <button
                    className="btn btn-secondary cta2"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Eliminar ${item.name} del carrito`}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <footer className="cart__footer">
        <div className="cart__subtotal">
          <span>Subtotal</span>
          <strong>{formatPriceCLP(cartContext.subtotal)}</strong>
        </div>
        {/* Hook up taxes/shipping/promo here if needed */}
        <button className="btn btn-primary cta1">Continuar con el pago</button>
      </footer>
    </section>
  )
}