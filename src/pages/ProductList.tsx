import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import ProductFilters from '../components/ProductFilters'
import { products as allProducts } from '../data/products'
import { PriceRange, Product } from '../types/Product'
import './ProductList.css'
import { getPriceRange } from '../libs'
import { useToast } from '../components/ToastProvider'

const ProductList = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortSupplier, setSortSupplier] = useState<string>('')
  const [sortPrice, setSortPrice] = useState<PriceRange>({min: 0, max: 0})

  const toast = useToast()

  // Filter and sort products based on criteria
  const filterProducts = (category: string, search: string, sort: string, supplier:string, price:PriceRange) => {
    let filtered = [...allProducts]

    if(price.max !== 0 || price.min !== 0){
      const range = getPriceRange(price.min, price.max)
      filtered = filtered.filter(products => products.basePrice >= range.min && products.basePrice <= range.max)
    }

    if(supplier){
      filtered = filtered.filter(products => products.supplier === supplier)
    }

    // Category filter
    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category)
    }

    // Search filter
    if (search) {
      filtered = filtered.filter(product => 
        product.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) || // Solucion Bug de Busqueda
        product.sku.includes(search)
      )
    }

    // Sorting logic
    switch (sort) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      // Solucion bug 2 + filtro mas especifico
      case 'price-high':
        filtered.sort((a, b) => b.basePrice - a.basePrice)
        break
      case 'price-low':
        filtered.sort((a, b) => a.basePrice - b.basePrice)
        break
      // final Solucion bug 2
      case 'stock':
        filtered.sort((a, b) => b.stock - a.stock)
        break
      default:
        break
    }
    setFilteredProducts(filtered)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterProducts(category, searchQuery, sortBy, sortSupplier, sortPrice)
  }

  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    filterProducts(selectedCategory, search, sortBy, sortSupplier, sortPrice)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    filterProducts(selectedCategory, searchQuery, sort, sortSupplier, sortPrice)
  }

  const handleSupplierChange = (supplier: string) => {
    setSortSupplier(supplier)
    filterProducts(selectedCategory, searchQuery, sortBy, supplier, sortPrice)
  }

  const handlePriceChange = (min:number, max:number) => {
    setSortPrice({min, max})
  }
  const handlePriceFilter = () => {
    filterProducts(selectedCategory, searchQuery, sortBy, sortSupplier, {min:sortPrice.min, max:sortPrice.max})
  }

  const handleClearFilter = () => {
    setSelectedCategory("all")
    setSearchQuery("")
    setSortBy("name")
    setSortSupplier("none")
    setSortPrice({min: 0, max: 0})
    setFilteredProducts(allProducts)
    toast.info("Se han borrado los filtros")
  }

  return (
    <div className="product-list-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-info">
            <h1 className="page-title h2">Catálogo de Productos</h1>
            <p className="page-subtitle p1">
              Descubre nuestra selección de productos promocionales premium
            </p>
          </div>
          
          <div className="page-stats">
            <div className="stat-item">
              <span className="stat-value p1-medium">{filteredProducts.length}</span>
              <span className="stat-label l1">productos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value p1-medium">6</span>
              <span className="stat-label l1">categorías</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ProductFilters
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          sortBy={sortBy}
          selectedSupplier={sortSupplier}
          sortPrice={sortPrice}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onSupplierChange={handleSupplierChange}
          onPriceChange={handlePriceChange}
          onApplyPriceFilter={handlePriceFilter}
          onClearFilter={handleClearFilter}
        />

        {/* Products Grid */}
        <div className="products-section">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons">search_off</span>
              <h3 className="h2">No hay productos</h3>
              <p className="p1">No se encontraron productos que coincidan con tu búsqueda.</p>
              <button 
                className="btn btn-primary cta1"
                onClick={() => handleClearFilter()}
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductList