import React, { useState, useEffect, useMemo } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { backendURL } from "../App";
import { toast } from "react-toastify";

const Checkout = ({ token }) => {
  const shipping = 10;
  const tax = 5;

  const navigate = useNavigate();

  const [cartData, setCartData] = useState({});
  const [productsById, setProductsById] = useState({});

  const [method, setMethod] = useState("COD");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  //Fetch cartData
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        setCartData({});
        return;
      }

      try {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please Login first");
      return;
    }

    try {
      let orderItems = [];

      for (const itemId of Object.keys(cartData || {})) {
        const sizesObj = cartData[itemId] || {};

        for (const size of Object.keys(sizesObj)) {
          const qty = Number(sizesObj[size] || 0);
          if (qty <= 0) continue;

          const product = productsById[itemId];
          if (!product) continue;

          orderItems.push({
            ...structuredClone(product),
            size,
            quantity: qty,
          });
        }
      }

      if (!orderItems.length) {
        toast.error("Your cart is empty");
        return;
      }

      console.log(orderItems);

      const orderData = {
        address: formData,
        items: orderItems,
        amount: subtotal + shipping + tax,
      };

      switch (method) {

        case "COD": {
          const res = await fetch(`${backendURL}/order/place`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              token,
            },
            body: JSON.stringify(orderData),
          });

          const data = await res.json();

          if (data.success) {
            toast.success(data.message);
            setCartData({});
            setProductsById({});
            window.dispatchEvent(new Event("cart:updated"));
            navigate("/orders");
          } else {
            toast.error(data.message);
          }

          break;
        }

        case "Stripe": {
          const resCard = await fetch(`${backendURL}/order/stripe`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              token,
            },
            body: JSON.stringify(orderData),
          });

          const dataCard = await resCard.json();

          if (dataCard.success) {
            const { session_url } = dataCard;
            toast.success(dataCard.message);
            setProductsById({});
            window.location.replace(session_url);
          } else {
            toast.error(dataCard.message);
          }

          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <>
      <Form className="container mt-4" onSubmit={handleSubmit}>
        <div className="row">
          {/* LEFT SIDE — DELIVERY INFO */}
          <div className="col-lg-6 col-12 mb-4">
            <h1 className="mb-4">Delivery info</h1>

            <div className="row mb-3">
              <div className="col-6">
                <Form.Control
                  type="text"
                  placeholder="First Name"
                  required
                  onChange={onChangeHandler}
                  name="firstName"
                  value={formData.firstName}
                />
              </div>
              <div className="col-6">
                <Form.Control
                  type="text"
                  placeholder="Last Name"
                  required
                  onChange={onChangeHandler}
                  name="lastName"
                  value={formData.lastName}
                />
              </div>
            </div>

            <div className="mb-3">
              <Form.Control
                type="email"
                placeholder="Email"
                required
                onChange={onChangeHandler}
                name="email"
                value={formData.email}
              />
            </div>

            <div className="mb-3">
              <Form.Control
                type="text"
                placeholder="Street"
                required
                onChange={onChangeHandler}
                name="street"
                value={formData.street}
              />
            </div>

            <div className="row mb-3">
              <div className="col-6">
                <Form.Control
                  type="text"
                  placeholder="City"
                  required
                  onChange={onChangeHandler}
                  name="city"
                  value={formData.city}
                />
              </div>
              <div className="col-6">
                <Form.Control
                  type="text"
                  placeholder="State"
                  required
                  onChange={onChangeHandler}
                  name="state"
                  value={formData.state}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-6">
                <Form.Control
                  type="number"
                  placeholder="ZIP Code"
                  required
                  onChange={onChangeHandler}
                  name="zipcode"
                  value={formData.zipcode}
                />
              </div>
              <div className="col-6">
                <Form.Control
                  type="text"
                  placeholder="Country"
                  required
                  onChange={onChangeHandler}
                  name="country"
                  value={formData.country}
                />
              </div>
            </div>

            <div className="mb-3">
              <Form.Control
                type="number"
                placeholder="Phone Number"
                required
                onChange={onChangeHandler}
                name="phone"
                value={formData.phone}
              />
            </div>
          </div>

          {/* RIGHT SIDE — ORDER SUMMARY */}
          <div className="col-lg-6 col-12">
            <div className="border rounded p-4">
              <h4 className="mb-4">Order Summary</h4>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary">Subtotal</span>
                <span>${subtotal}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary">Shipping Fee</span>
                <span>${shipping}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary">Tax Fee</span>
                <span>${tax}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <h5>Total</h5>
                <h5>${subtotal + shipping + tax}</h5>
              </div>

              <h5 className="mb-3">Payment Method</h5>

              <div className="d-flex flex-column flex-lg-row mb-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMethod("Stripe");
                  }}
                  className={`btn transition w-100 w-lg-50 ${
                    method === "Stripe" ? "btn-dark" : "btn-outline-dark"
                  }`}
                >
                  <i className="bi bi-credit-card" /> Stripe
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMethod("COD");
                  }}
                  className={`btn transition w-100 w-lg-50 ${
                    method === "COD" ? "btn-dark" : "btn-outline-dark"
                  }`}
                >
                  <i className="bi bi-cash-stack" /> Cash on delivery
                </button>
              </div>

              <Button variant="dark" className="w-100 py-2" type="submit">
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </>
  );
};

export default Checkout;