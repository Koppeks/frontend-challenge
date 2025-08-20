import { CartItem, FormQuote } from "./types/Product"

/**
 * Aca es donde guardo y obtengo la informacion del localstorage,
 * que se sincroniza con el provider de que ve el usuario en vivo.
 * (No se roben mis credenciales)
 */

export const CART_KEY = 'cart:v1';
export const FORM_KEY = 'form:v1';

export const loadCart = (): CartItem[] => {
  try {
    const rawCart = localStorage.getItem(CART_KEY)
    if (!rawCart) return []
    const parsedCart = JSON.parse(rawCart)
    console.log(parsedCart)
    return Array.isArray(parsedCart) ? parsedCart : []
  } catch {
    return []
  }
}

export const saveCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch {
  }
}

const initialFormQuote: FormQuote = {
  email: '',
  title: '',
  message: '',
  name: '',
}

export function loadFormQuote(): FormQuote {
  try {
    const raw = localStorage.getItem(FORM_KEY)
    return raw ? { ...initialFormQuote, ...JSON.parse(raw) } : initialFormQuote
  } catch {
    return initialFormQuote
  }
}

export function saveFormQuote(state: FormQuote) {
  try {
    localStorage.setItem(FORM_KEY, JSON.stringify(state))
  } catch {
    // ignore (quota/private mode)
  }
}
