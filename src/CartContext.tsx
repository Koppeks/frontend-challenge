import { createContext, useContext, useEffect, useReducer } from "react"
import { loadCart, saveCart } from "./Storage"
import { CartContextInterface, CartItem } from "./types/Product"
import { consolidateCart, lineKey, norm, recalcLine, upsertCartLine } from "./libs"

/**
 * 
 * contexto del carro de compras, tiene 4 acciones que son agregar, eliminar, modificar y limpiar.
 * Casi como un CRUD, en el provider al final es donde se sincroniza lo que ve y decide hacer
 * el usuario con su carrito en el localstorage
 * 
 *  No les voy a mentir, esta es la primera vez que utilizo el context de react.
 * Siempre utilize redux o zustand para manejar estados muy grandes.
 * 
 */

const CartContext = createContext<CartContextInterface>({cart: [], countItems: 0, countAllItems:0, subtotal:0})

export const CART_ACTIONS = {
  INSERT: 'cart/insert',
  REMOVE: 'cart/remove',
  CLEAR:  'cart/clear',
  CHANGE_QTY: 'cart/change-qty',
} as const

type CartAction =
  | { type: typeof CART_ACTIONS.INSERT; payload: CartItem }
  | { type: typeof CART_ACTIONS.REMOVE; payload: { id: number; selectedColor?: string; selectedSize?: string } }
  | { type: typeof CART_ACTIONS.CLEAR }
  | { type: typeof CART_ACTIONS.CHANGE_QTY; payload: { id: number; selectedColor?: string; selectedSize?: string; delta: number } }

const defaultDispatch: React.Dispatch<CartAction> = () => {}
const CartDispatchContext = createContext<React.Dispatch<CartAction>>(defaultDispatch)


export function useCart () {
  return useContext(CartContext)
}
export function useCartDispatch () {
  return useContext(CartDispatchContext)
}

function CartReducer(state: CartItem[], action: CartAction) {
  switch (action.type) {
    case CART_ACTIONS.INSERT:{
      return upsertCartLine(state, action.payload)
    }
    case CART_ACTIONS.REMOVE:{
      return state.filter(i => !(i.id === action.payload.id && i.selectedColor === action.payload.selectedColor && i.selectedSize === action.payload.selectedSize))
    }
    case CART_ACTIONS.CLEAR:{
      return []
    }
 case CART_ACTIONS.CHANGE_QTY: {
      const { id, selectedColor, selectedSize, delta } = action.payload
      const key = `${id}|${norm(selectedColor)}|${norm(selectedSize)}`
      const idx = state.findIndex(it => lineKey(it) === key)
      if (idx < 0) return state

      const line = state[idx]
      const stock = line.stock ?? Infinity
      const nextQty = Math.max(0, Math.min(stock, (line.quantity ?? 1) + delta))

      // remove the line if it hits 0
      if (nextQty === 0) {
        const copy = state.slice()
        copy.splice(idx, 1)
        return copy
      }

      const { quantity, price, totalPrice } = recalcLine(line, nextQty)
      const next = state.slice()
      next[idx] = { ...line, quantity, unitPrice: price, totalPrice }
      return next
    }
    default:
      return state
  }
}

export const CartProvider = ({ children } : {children: React.ReactNode}) => {
  const [cart, dispatch] = useReducer(CartReducer, CartContext, () => consolidateCart(loadCart())) // hydrate once
  useEffect(() => { saveCart(cart) }, [cart]) // persist

  const countAllItems = cart.reduce((n, i) => n + i.quantity, 0)
  const countItems = cart.length;
  const subtotal = cart.reduce((sum, it) => sum + Math.round(it.totalPrice ?? (it.unitPrice * Math.max(1, it.quantity ?? 1))), 0)
  return (
    <CartContext.Provider value={{cart,countItems, countAllItems, subtotal}}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartContext.Provider>
  )
}
