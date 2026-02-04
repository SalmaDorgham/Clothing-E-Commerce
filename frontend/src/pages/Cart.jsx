import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import productImg from "../assets/images/product.png";
import { backendURL } from "../App";
import { toast } from "react-toastify";

const Cart = ({ token }) => {
  const shipping = 10;
  const tax = 5;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [cartData, setCartData] = useState({});
  const [productsById, setProductsById] = useState({});

  const rows = useMemo(() => {
    const out = [];
    for (const itemId of Object.keys(cartData || {})) {
      const sizesObj = cartData[itemId] || {};
      for (const size of Object.keys(sizesObj)) {
        const qty = sizesObj[size];
        if (qty > 0) out.push({ itemId, size, quantity: qty });
      }
    }
    return out;
  }, [cartData]);

  const subtotal = useMemo(() => {
    return rows.reduce((sum, r) => {
      const p = productsById[r.itemId];
      const price = Number(p?.price || 0);
      return sum + price * Number(r.quantity || 0);
    }, 0);
  }, [rows, productsById]);

  //Fetch cartData
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        setLoading(false);
        setCartData({});
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(`${backendURL}/cart/get`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token,
          },
        });

        const data = await res.json();

        if (data.success) {
          setCartData(data.cartData || {});
        } else {
          toast.error(data.message);
          setCartData({});
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
        setCartData({});
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  // Fetch product details
  useEffect(() => {
    const fetchProducts = async () => {
      const ids = Object.keys(cartData || {});
      if (!ids.length) {
        setProductsById({});
        return;
      }

      try {
        const entries = await Promise.all(
          ids.map(async (productId) => {
            if (productsById[productId]) return [productId, productsById[productId]];

            const res = await fetch(
              `${backendURL}/product/single?productId=${encodeURIComponent(productId)}`
            );
            const data = await res.json();
            if (data.success) return [productId, data.product];
            return [productId, null];
          })
        );

        setProductsById((prev) => {
          const next = { ...prev };
          for (const [id, p] of entries) {
            if (p) next[id] = p;
          }
          return next;
        });
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartData]);

  const updateQuantity = async (itemId, size, quantity) => {
    const qty = Number(quantity);

    if (!Number.isFinite(qty) || qty < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    try {
      const res = await fetch(`${backendURL}/cart/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ itemId, size, quantity: qty }),
      });

      const data = await res.json();

      if (data.success) {
        setCartData((prev) => {
          const next = { ...(prev || {}) };
          next[itemId] = { ...(next[itemId] || {}) };
          next[itemId][size] = qty;
          return next;
        });

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

  const removeItem = async (itemId, size) => {
    if (!token) {
      toast.error("Please Login first");
      return;
    }

    try {
      const res = await fetch(`${backendURL}/cart/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ itemId, size, quantity: 0 }),
      });

      const data = await res.json();

      if (data.success) {
        setCartData((prev) => {
          const next = { ...(prev || {}) };
          if (!next[itemId]) return next;

          const sizesObj = { ...(next[itemId] || {}) };
          delete sizesObj[size];

          if (Object.keys(sizesObj).length === 0) {
            delete next[itemId];
          } else {
            next[itemId] = sizesObj;
          }

          return next;
        });

        toast.success("Removed from cart");
        window.dispatchEvent(new Event("cart:updated"));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleCheckout = (e) => {
    e.preventDefault();

    if (loading) {
      toast.info("Please wait, loading your cart...");
      return;
    }

    if (!rows.length) {
      toast.error("Your cart is empty. Add items before checkout.");
      return;
    }

    navigate("/checkout");
  };

  return (
    <>
      <div>
        <div className="d-flex justify-content-between align-items-center" style={{ width: "100%" }}>
          <h1>My cart</h1>
          <Link to="/browse" className="btn btn-dark">
            Continue Shopping &gt;
          </Link>
        </div>

        <div className="row mt-3">
          {/* Cart table */}
          <div className="col-lg-8 col-12">
            {loading && <p className="mt-3">Loading...</p>}

            {!loading && rows.length === 0 && <p className="mt-3">Your cart is empty.</p>}

            {!loading && rows.length > 0 && (
              <table className="table">
                <tbody>
                  {rows.map((r) => {
                    const p = productsById[r.itemId];
                    const imgSrc = p?.image?.[0] || productImg;

                    return (
                      <tr key={`${r.itemId}-${r.size}`}>
                        <td width="125px">
                          <img
                            src={imgSrc}
                            alt={p?.name || "product"}
                            width="125"
                            height="125"
                            style={{ objectFit: "cover", borderRadius: 10 }}
                            onError={(e) => (e.currentTarget.src = productImg)}
                          />
                        </td>

                        <td>
                          <h6 className="mb-0">
                            {p?.name || "Loading..."}
                            <br />
                            <br />
                            ${p?.price ?? 0}
                          </h6>
                        </td>

                        <td>
                          <h6 className="mb-0">{r.size}</h6>
                        </td>

                        <td width="120px">
                          <Form.Control
                            type="number"
                            min={1}
                            value={r.quantity}
                            onChange={(e) => updateQuantity(r.itemId, r.size, e.target.value)}
                          />
                        </td>

                        <td className="text-end align-middle">
                          <i
                            className="bi bi-trash3-fill"
                            style={{ cursor: "pointer" }}
                            onClick={() => removeItem(r.itemId, r.size)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Checkout Card */}
          <div className="col-lg-4 col-12 ms-auto">
            <div className="card p-4 shadow-sm">
              <h4 className="fw-bold mb-4">Order Summary</h4>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Shipping estimate</span>
                <span>${shipping}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Tax estimate</span>
                <span>${tax}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold m-0">Total</h5>
                <h5 className="fw-bold m-0">${(subtotal + shipping + tax).toFixed(2)}</h5>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading || rows.length === 0}
                type="button"
                variant="dark"
                className="w-100 mb-3"
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
