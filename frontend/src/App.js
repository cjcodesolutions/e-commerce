import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Signup from './components/Signup';
import Login from './components/Login';
import Welcome from './components/Welcome';
import UserDashboard from './components/UserDashboard';
import ShoppingCartPage from './components/ShoppingCartPage';
import ProductsPage from './components/ProductsPage';
import SellerDashboard from './components/SellerDashboard';
import Cart from './components/Cart';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          {/* <Route path="/cart" element={<ShoppingCartPage />} /> */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/cart" element={<Cart />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;