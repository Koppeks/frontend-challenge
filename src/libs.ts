import { FormQuote, FormQuoteErrors, PriceBreak, Product, QuoteSummary } from "./types/Product"

export const getPriceRange = (num1:number, num2:number) =>{
  num1 = num1 < 0 ? 0 : num1
  num2 = num2 < 0 ? 0 : num2
  if(num1 > num2){
    return {min: num2, max:num1}
  }else if(num1 < num2){
    return {min: num1, max: num2}
  }
  return {min: 0, max: num1}
}

export const getApplicableBreak = (qty: number, product: Product): PriceBreak | undefined => {
  if (!product.priceBreaks?.length) return undefined
  let applied: PriceBreak | undefined
  for (const br of product.priceBreaks) {
    if (qty >= br.minQty) applied = br
  }
  return applied
}

export const calculatePrice = (qty: number, product: Product) => {
    if (!product.priceBreaks || product.priceBreaks.length === 0) {
      return product.basePrice * qty
    }

    // Find applicable price break
    let applicableBreak = product.priceBreaks[0]
    for (let i = 0; i < product.priceBreaks.length; i++) {
      if (qty >= product.priceBreaks[i].minQty) {
        applicableBreak = product.priceBreaks[i]
      }
    }

    return applicableBreak.price * qty
  }

  // Calculate discount amount
  export const getDiscount = (qty: number, product:Product) => {
    if (!product.priceBreaks || product.priceBreaks.length === 0) {
      return 0
    }

    const baseTotal = product.basePrice * qty
    const discountedTotal = calculatePrice(qty, product)
    
    // Calculate savings percentage
    return ((baseTotal - discountedTotal) / baseTotal) * 100
  }

export const canAddToCart = (product:Product) => {
  return product.status === 'active' && product.stock > 0
}

  // Format price display
  export const formatPriceCLP = (price: number) => {
    // Price always should show the proper Chilean currency format.
    return `${price.toLocaleString("es-CL", {style: "currency", currency:"CLP"})}`
  }

  function getUnitPriceWithBreak(qty: number, product: Product): { unitPrice: number; discountPercent: number; appliedBreak?: PriceBreak } {
  const applied = getApplicableBreak(qty, product)
  if (!applied) return { unitPrice: product.basePrice, discountPercent: 0, appliedBreak: undefined }

  if (typeof applied.price === 'number') {
    const unit = applied.price
    const dPct = Math.min(100, Math.max(0, 1 - unit / product.basePrice) * 100)
    return { unitPrice: unit, discountPercent: dPct, appliedBreak: applied }
  }
  if (typeof applied.discount === 'number') {
    const dPct = Math.min(100, Math.max(0, applied.discount))
    return { unitPrice: product.basePrice * (1 - dPct / 100), discountPercent: dPct, appliedBreak: applied }
  }
  return { unitPrice: product.basePrice, discountPercent: 0, appliedBreak: applied }
}

  export function buildQuoteSummary(product: Product, quantity: number, taxRatePct?: number): QuoteSummary {
  const qty = Math.max(1, Math.floor(quantity || 1))
  const baseUnit = product.basePrice
  const { unitPrice, discountPercent, appliedBreak } = getUnitPriceWithBreak(qty, product)
  const subtotal = Math.round(unitPrice * qty)
  const baseTotal = Math.round(baseUnit * qty)
  const discountCLP = Math.max(0, baseTotal - subtotal)
  const taxCLP = taxRatePct ? Math.round(subtotal * (taxRatePct / 100)) : undefined
  const totalCLP = taxCLP ? subtotal + taxCLP : subtotal

  return {
    productId: product.id,
    productName: product.name,
    quantity: qty,
    baseUnit,
    unitPrice,
    discountPercent,
    discountCLP,
    subtotalCLP: subtotal,
    taxCLP,
    totalCLP,
    appliedBreak,
  }
}

export function downloadJSON(summary: QuoteSummary) {
  const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cotizacion_${summary.productId}_${summary.quantity}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export const isLikelyEmail = (value: string) => {
  const s = value.trim()
  if (!s || s.length > 254) return false
  const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  if (!re.test(s)) return false
  const [local, domain] = s.split('@')
  if (local.includes('..') || domain.includes('..')) return false
  return domain.split('.').every(label => !/^-|-$/.test(label))
}


export function validateFormQuote(v: FormQuote):FormQuoteErrors {
  
  const e: FormQuoteErrors = {}

  console.log(v)
  console.log(isLikelyEmail(v.email))

  if (!v.email) e.email = 'El email es requerido.'
  else if (!isLikelyEmail(v.email)) e.email = 'Formato de email inválido.'

  if (!v.title) e.title = 'El título es requerido.'
  else if (v.title.length < 3) e.title = 'Usa al menos 3 caracteres.'

  if (!v.name) e.name = 'El nombre es requerido.'
  else if (v.name.length < 2) e.name = 'Usa al menos 2 caracteres.'

  if (!v.message) e.message = 'El mensaje es requerido.'
  else if (v.message.length < 10) e.message = 'Usa al menos 10 caracteres.'

  console.log(e)
  return e
}