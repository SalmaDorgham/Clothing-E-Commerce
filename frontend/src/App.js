import './App.css';
import { useState, useEffect } from 'react';
import {Routes, Route, Navigate} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from './pages/Home'
import Browse from './pages/Browse'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Cart from './pages/Cart'
import Product from './pages/Product'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Header from './components/Header';
import Footer from './components/Footer';
import Error404 from './pages/Error404'
import {ToastContainer} from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Verify from './pages/Verify';
import ScrollToTop from './components/ScrollToTop';

export const backendURL = process.env.REACT_APP_BACKEND_URL;

const ProtectedRoute = ({ token, children }) => {
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {

  const [token, setToken] = useState(localStorage.getItem('token')? localStorage.getItem('token'):'');
  
  useEffect ( () => {
    localStorage.setItem('token', token)
  },[token])

  return (
    <div className="px-3 px-sm-4 px-md-5 px-lg-5">

      <ScrollToTop />
        <Header token={token} setToken={setToken}/> {/* cart counter + log in/out button*/}
        <hr />

        <Routes>
          {/* Public */}
          <Route path = '/' element={ <Home/> }/>
          <Route path = '/browse' element={ <Browse/> }/>
          <Route path = '/contact' element={ <Contact/> }/>
          <Route path = '/login' element={ <Login setToken={setToken}/> }/>
          <Route path = '/product/:id' element={ <Product token={token}/> }/> {/* add to cart feature*/}
          <Route path = '*' element={ <Error404/> }/>
          
          {/* Protected */}
          <Route path="/cart" element={ <ProtectedRoute token={token}> <Cart token={token} /> </ProtectedRoute>} />
          <Route path="/checkout" element={ <ProtectedRoute token={token}> <Checkout token={token} /> </ProtectedRoute>} />
          <Route path="/orders" element={ <ProtectedRoute token={token}> <Orders token={token} /> </ProtectedRoute>} />
          <Route path="/verify" element={ <ProtectedRoute token={token}> <Verify token={token} /> </ProtectedRoute>} />

        </Routes>

        <hr />
        <Footer />

        <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}

export default App;