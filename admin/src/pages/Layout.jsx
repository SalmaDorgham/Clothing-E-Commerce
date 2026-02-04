import React from 'react'
import "../assets/css/Layout.css";
import Button from 'react-bootstrap/Button';
import { NavLink, Outlet } from "react-router-dom";

const Layout = ({setToken}) => {


  return (
    <>

    <div className="topbar">
        <div>
          <h1>Fashion</h1>
          <div className="brand-sub">ADMIN PANEL</div>
        </div>

        <Button onClick={()=>setToken('')} className='logout-btn' variant="dark" type="submit">Logout</Button>
    </div>

    <hr />

     <div className='row mt-4'>

        <div className='p-3 col-lg-2 col-md-3 col-12 side-bar text-center'>

            <div className="d-grid gap-2">
                <NavLink to="/orders"
                    className={({ isActive }) => `btn ${isActive ? "btn-dark" : "btn-outline-dark"}`}>
                    <i className="bi bi-box-seam-fill icons"></i>
                    Orders
                </NavLink>

                <NavLink to="/items"
                    className={({ isActive }) => `btn ${isActive ? "btn-dark" : "btn-outline-dark"}`}>
                    <i className="bi bi-collection-fill icons"></i>
                    Items
                </NavLink>

                <NavLink to="/add"
                    className={({ isActive }) => `btn ${isActive ? "btn-dark" : "btn-outline-dark"}`}>
                    <i className="bi bi-plus-square-fill icons"></i>
                    Add Item
                </NavLink>

                <NavLink to="/banners"
                    className={({ isActive }) => `btn ${isActive ? "btn-dark" : "btn-outline-dark"}`}>
                    <i className="bi bi-images icons"></i>
                    Banners
                </NavLink>

                <NavLink to="/addbanner"
                    className={({ isActive }) => `btn ${isActive ? "btn-dark" : "btn-outline-dark"}`}>
                    <i className="bi bi-plus-square-fill icons"></i>
                    Add Banner
                </NavLink>
            </div>

        </div>

        <div className='col-lg-10 col-md-9 col-12 main-display'>
            <Outlet />
        </div>

     </div>
    </>
  )
}

export default Layout