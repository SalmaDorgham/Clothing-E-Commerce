import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productImg from "../assets/images/product.png";
import ProductCard from "../components/ProductCard";
import { backendURL } from "../App";
import { toast } from "react-toastify";
import "../assets/css/Product.css";

const Product = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState(null);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [mainImage, setMainImage] = useState("");

  // FETCH PRODUCT
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${backendURL}/product/single?productId=${encodeURIComponent(id)}`
        );

        const data = await res.json();
        console.log(data);

        if (data.success) {
          setProduct(data.product);
          const firstImg = data.product?.image?.[0] || "";
          setMainImage(firstImg);
        } else {
          toast.error(data.message);
          navigate("/404");
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    };

    if (id) fetchProduct();
  }, [id, navigate]);

  // FETCH RELATED PRODUCTS
  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      try {
        const res = await fetch(`${backendURL}/product/list`);
        const data = await res.json();

        if (data.success) {
          const filtered = (data.products || [])
            .filter(
              (item) =>
                item.category === product.category &&
                item.color === product.color &&
                item._id !== product._id
            )
            .slice(0, 4);

          setRelated(filtered);
          console.log(filtered);
          console.log(related);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    };

    fetchRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (!product) {
    return <p className="text-center mt-4">Loading...</p>;
  }

  const images = product.image?.length ? product.image : [productImg];
  const availableSizes = product.sizes || [];

  const addtoCart = async (itemId, selectedSize) => {
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }

    if (!token) {
      toast.error("Please Login first");
      return;
    }

    try {
      const res = await fetch(`${backendURL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({ itemId, size: selectedSize }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        window.dispatchEvent(new Event("cart:updated"));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="card card-product card-plain p-4">
        <div className="row">
          {/* LEFT SIDE – Images */}
          <div className="col-12 col-lg-4">
            {/* Main Image */}
            <img
              className="img-fluid rounded-2 mb-3"
              style={{ width: "100%", objectFit: "cover" }}
              src={mainImage || productImg}
              alt={product.name}
              onError={(e) => (e.currentTarget.src = productImg)}
            />

            {/* Thumbnails */}
            <div className="row g-3">
              {images.slice(0, 4).map((img, idx) => (
                <div className="col-3" key={idx}>
                  <img
                    className={`img-fluid rounded-2 thumb-img ${
                      mainImage === img ? "active-thumb" : ""
                    }`}
                    src={img}
                    alt={`${product.name}-${idx}`}
                    style={{
                      cursor: "pointer",
                      objectFit: "cover",
                      height: 70,
                      width: "100%",
                    }}
                    onClick={() => setMainImage(img)}
                    onError={(e) => (e.currentTarget.src = productImg)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE – Product Info */}
          <div className="col-12 col-lg-6 mt-5 mt-lg-0">
            <h2>{product.name}</h2>

            <div className="d-flex mb-3">
              <h4 className="fw-normal">${product.price}</h4>
            </div>

            <div className="text-muted small">
              <div>
                <strong>Category:</strong> {product.category}
              </div>
              <div>
                <strong>Type:</strong> {product.subCategory}
              </div>
              <div>
                <strong>Color:</strong> {product.color}
              </div>
            </div>

            <p className="mt-4">{product.description}</p>

            <h6 className="mt-5 mb-2">Select Size:</h6>
            <div className="d-flex gap-3 flex-wrap">
              {availableSizes.map((size) => (
                <div
                  key={size}
                  className={`size-pill ${selectedSize === size ? "active" : ""}`}
                  onClick={() => setSelectedSize(size)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedSize(size)}
                >
                  {size}
                </div>
              ))}
            </div>

            <div className="d-flex align-items-center mt-4">
              <button
                className="btn btn-dark btn-lg me-4"
                disabled={!selectedSize}
                onClick={() => addtoCart(product._id, selectedSize)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <h5 className="mb-4 mt-4">Related Products</h5>
      {!related ? (
        <p className="text-center mt-4">No similar products found</p>
      ) : (
        <>
          <div className="row row-cols-2 row-cols-md-5 g-4">
            {related.map((item) => (
              <div className="col" key={item._id}>
                <ProductCard
                  id={item._id}
                  title={item.name}
                  image={item.image?.[0]}
                  price={item.price}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default Product;
