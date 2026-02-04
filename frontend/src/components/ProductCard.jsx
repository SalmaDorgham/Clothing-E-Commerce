import {Link} from 'react-router-dom'
import productImg from '../assets/images/product.png'
import '../assets/css/ProductCard.css'

const ProductCard = ({ id, title, image, price }) => {
  return (
    <Link to={`/product/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="col">
          <div className="card">
              <div className="small-card-img-wrapper">
                <img src={image} alt={title} className="card-img-top product-img image-zoom" 
                  onError={(e) => {
                    e.target.src = productImg;
                  }}
                />
              </div>
              <div className="card-body">
                  <h5 className="card-title">{title}</h5>
                  <p className="card-text">${price}</p>
              </div>
          </div>
      </div>
    </Link>
  )
}

export default ProductCard