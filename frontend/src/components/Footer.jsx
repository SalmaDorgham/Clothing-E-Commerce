import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div className="container" style={{height:"350px", marginTop: "50px"}}>
        <div className="row">
{/* logo + socials */}
          <div className='col'>
            <h3 >Fashion</h3>
            <div style={{padding:"5px"}}>
              <a target="_blank" style={{padding:"5px", color: "black"}} rel="noopener noreferrer" href="https://www.facebook.com/Leapsolutionskw"><i className="bi bi-facebook"></i></a>
              <a target="_blank" style={{padding:"5px", color: "black"}} rel="noopener noreferrer" href="https://www.tiktok.com/@leaptechkw"><i className="bi bi-tiktok"></i></a>
              <a target="_blank" style={{padding:"5px", color: "black"}} rel="noopener noreferrer" href="https://www.instagram.com/leaptechkw"><i className="bi bi-instagram"></i></a>              
            </div>
          </div>
{/* navigations */}
          <div className='col'>
            <h6  className='infop1'>Navigation</h6>
            <ul style={{listStyleType:"none"}}>
              <li><Link className="nav-link" to="/">Home</Link></li>
              <li><Link className="nav-link" to="/contact">Contact</Link></li>
              <li><Link className="nav-link" to="/browse">Collection</Link></li>
            </ul>
          </div>
{/* address */}
          <div className='col'>
            <h6 className='infop1'>Get in touch</h6>
            <ul style={{listStyleType:"none", float:"left"}}>
              <li> <i className="bi bi-geo-alt-fill"></i> area, block, street</li> 
              <li> <i className="bi bi-telephone-fill"></i> +965 12345678</li>
              <li><i className="bi bi-envelope-at-fill"></i> info@fashion.com</li>
            </ul>
          </div>
        </div>
{/* copyright */}
        <hr />
        <h6 className="text-center">Copyright 2025@ Fashion - All Right Reserved</h6>
    </div>
  )
}

export default Footer