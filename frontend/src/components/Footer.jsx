import Button from 'react-bootstrap/Button';
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
              <li>
                <Link className="nav-link" to="/browse">Collection</Link>
                <ul style={{listStyleType:"none"}}>
                  <li><Link className="nav-link" to={`/browse?category=Men`}>Men</Link></li>
                  <li><Link className="nav-link" to={`/browse?category=Women`}>Women</Link></li>
                  <li><Link className="nav-link" to={`/browse?category=Kids`}>Kids</Link></li>
                </ul>
              </li>
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

        {/* email service */}
        <br />
        <br />
      <div className='text-center'>
        <h3>Subscribe for XXX YYY ZZZ</h3>
        <p className='infop2'>Lorem IpsumLorem IpsumLorem IpsumLorem Ipsum</p>
        <form className="d-flex" style={{justifyContent:"center"}}>
          <input className="form-control me-2" type="text" placeholder="you@example.com" style={{width:"50%"}}/>
          <Button variant="dark" type="submit">submit</Button>
        </form>
        </div>

{/* copyright */}
        <hr />
        <h6 className="text-center">Copyright 2025@ Fashion - All Right Reserved</h6>
        <br />
    </div>
  )
}

export default Footer