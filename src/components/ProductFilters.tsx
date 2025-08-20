
import { categories, suppliers } from '../data/products'
import { PriceRange } from '../types/Product'
import './ProductFilters.css'

/**
 * Modifique el sortBy, agregue filtros de suplier, de rango de precios, y para limpiar los filtros.
 * (Perdon si no se ve lindo, ya estoy muy cansado)
 * 
 * 
 */

interface ProductFiltersProps {
  selectedCategory: string
  searchQuery: string
  sortBy: string
  sortPrice: PriceRange
  selectedSupplier: string
  onCategoryChange: (category: string) => void
  onSearchChange: (search: string) => void
  onSortChange: (sort: string) => void
  onSupplierChange: (sort: string) => void
  onPriceChange: (min:number, max:number) => void
  onApplyPriceFilter: () => void
  onClearFilter: () => void
}

const ProductFilters = ({
  selectedCategory,
  searchQuery,
  sortBy,
  selectedSupplier,
  sortPrice,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  onSupplierChange,
  onPriceChange,
  onApplyPriceFilter,
  onClearFilter
}: ProductFiltersProps) => {

  return (
    <div className="product-filters">
      <div className="filters-card">
      <button className='btn btn-secondary cta1' onClick={() => onClearFilter()}>
        Clear filter
      </button>
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Buscar productos, SKU..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input p1"
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => onSearchChange('')}
              >
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Categorías</h3>
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => onCategoryChange(category.id)}
              >
                <span className="material-icons">{category.icon}</span>
                <span className="category-name l1">{category.name}</span>
                <span className="category-count l1">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Ordenar por</h3>
          <select 
            value={sortBy} 
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select p1"
          >
            <option value="name">Nombre A-Z</option>
            <option value="price-high">Precio Mayor</option>
            <option value="price-low">Precio Menor</option>
            <option value="stock">Stock disponible</option>
          </select>
        </div>

        {/* Quick Stats - Bug: hardcoded values instead of dynamic */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Proveedores</h3>
          <div className="category-filters">
            {suppliers.map(({id, name, products}) => (
              <div key={id} className={`category-btn ${selectedSupplier === id && " active"}`} onClick={() => onSupplierChange(id)}>
                <span className="category-name l1">{name}</span>
                <span className="category-name l1">{products}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="quantity-input-group">
          <input
            type="number"
            value={sortPrice.min > 0 ? sortPrice.min : 0}
            onChange={(e) => {
              onPriceChange(Number(e.target.value), sortPrice.max);
            }}
            className="quantity-input p1"
            min="0"
            />
          <span className="quantity-unit l1">Mínimo</span>
        </div>
        <div className="quantity-input-group">
          <input
            type="number"
            value={sortPrice.max > 0 ? sortPrice.max : 0}
            onChange={(e) => {
              onPriceChange(sortPrice.min, Number(e.target.value));
            }}
            className="quantity-input p1"
            min="0"
            />
          <span className="quantity-unit l1">Máximo</span>
        </div>
        <div className='btn btn-primary cta1' onClick={() => onApplyPriceFilter()}>
          Filtrar por precio
        </div>
      </div>
    </div>
  )
}

export default ProductFilters