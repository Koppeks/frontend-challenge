import { createContext, useContext, useEffect, useReducer } from "react"
import { loadCart, saveCart } from "./Storage"
import { CartContextInterface, CartItem } from "./types/Product"

const CartContext = createContext<CartContextInterface>({cart: [], countItems: 0, countAllItems:0, subtotal:0})

type CartAction = { type: string; payload: CartItem }
const defaultDispatch: React.Dispatch<CartAction> = () => {}
const CartDispatchContext = createContext<React.Dispatch<{type: string, payload:CartItem}>>(defaultDispatch)

export const ACTIONS = {
  CART_INSERT_ITEM: "add-item-to-cart",
  CART_REMOVE_ITEM: "remove-item-from-cart",
}

export function useCart () {
  return useContext(CartContext)
}
export function useCartDispatch () {
  return useContext(CartDispatchContext)
}

function CartReducer(state: CartItem[], action: {type:string, payload: CartItem}) {
  switch (action.type) {
    case ACTIONS.CART_INSERT_ITEM:{
      return [...state, action.payload]
    }
    case ACTIONS.CART_REMOVE_ITEM:{
      return state.filter(i => i.id === undefined ? true : i.id !== action.payload.id)
    }
    default:
      return state
  }
}

export const CartProvider = ({ children } : {children: React.ReactNode}) => {
  const [cart, dispatch] = useReducer(CartReducer, CartContext, () => loadCart()) // hydrate once
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
