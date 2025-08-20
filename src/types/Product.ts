export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  status: "active" | "inactive" | "pending";
  basePrice: number;
  stock: number;
  description?: string;
  image?: string;
  colors?: string[];
  sizes?: string[];
  features?: string[];
  // Pricing calculation fields
  minQuantity?: number;
  maxQuantity?: number;
  priceBreaks?: PriceBreak[];
}

export interface PriceBreak {
  minQty: number;
  price: number;
  discount?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface CartContextInterface {
  cart: CartItem[];
  countItems: number;
  countAllItems: number;
  subtotal: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Supplier {
  id: string;
  name: string;
  products: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface FormQuote {
  email: string;
  name: string;
  title: string;
  message: string;
}

export type FormQuoteErrors = Partial<Record<Field, string>>;

export type Field = "email" | "title" | "name" | "message";

export interface QuoteSummary {
  productId: number;
  productName: string;
  quantity: number;
  baseUnit: number;
  unitPrice: number;
  discountPercent: number;
  discountCLP: number;
  subtotalCLP: number;
  taxCLP?: number;
  totalCLP: number;
  appliedBreak?: PriceBreak;
}

export interface LoadingProps {
  open: boolean;
  text?: string;
}

export interface QuoteRequestInterface {
  quantity: number;
  product: Product;
  onClose?: () => void;
}
