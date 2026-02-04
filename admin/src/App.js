import {Routes, Route, Navigate} from 'react-router-dom'
import React, {useEffect, useState} from 'react'
import Layout from './pages/Layout';
import Items from './pages/Items';
import AddItem from './pages/AddItem';
import Orders from './pages/Orders';
import Login from './pages/Login';
import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {ToastContainer} from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Banners from './pages/Banners';
import AddBanner from './pages/AddBanner';

export const backendURL = process.env.REACT_APP_BACKEND_URL;

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token')? localStorage.getItem('token'):'');
  console.log("backendURL:", backendURL);

  useEffect ( () => {
    localStorage.setItem('token', token)
  },[token])

  return (
    <div className="px-3 px-sm-4 px-md-5 px-lg-5">

    { token === ""
    ? <Login setToken={setToken} />
    : <>
      <Routes>

        <Route path="/" element={<Layout setToken={setToken} />}>
            {/* default route */}
            <Route index element={<Navigate to="/orders" replace />} />

            <Route path="orders" element={<Orders token={token} />} />
            <Route path="items" element={<Items token={token} />} />
            <Route path="add" element={<AddItem token={token} />} />
            <Route path="banners" element={<Banners token={token} />} />
            <Route path="addbanner" element={<AddBanner token={token} />} />

            <Route path="*" element={<div>Not Found</div>} />
          </Route>

      </Routes>
      </>
    }

    <ToastContainer position="top-right" autoClose={2500} />
    </div>
  )
}

export default App