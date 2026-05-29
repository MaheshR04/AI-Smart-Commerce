import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>
            <ToastProvider>
              <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
                <Navbar />
                <main className="flex-grow flex flex-col">
                  <AppRoutes />
                </main>
                <Footer />
              </div>
            </ToastProvider>
          </CartProvider>
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
