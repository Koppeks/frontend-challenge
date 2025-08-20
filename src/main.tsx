import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { CartProvider } from './CartContext.tsx'
import { FormQuoteProvider } from './FormContext.tsx'
import Loading from './components/Loading.tsx'
import { ToastProvider } from './components/ToastProvider.tsx'

/**
 * Esta es mi solucion al loading state,
 * no se la agregue a las Cards porque no hay loading por ser un mockup
 */

const App = lazy(() => import('./App.tsx'))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<Loading open text='Cargando...'/>}>
        <CartProvider>
          <FormQuoteProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </FormQuoteProvider>
        </CartProvider>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
)