import React, { useEffect, useMemo, useState } from "react";
import Form from "react-bootstrap/Form";
import productImg from "../assets/images/product.png";
import { backendURL } from "../App";
import { toast } from "react-toastify";

const AdminOrders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const getTotalItems = (order) =>
    (order?.items || []).reduce((sum, it) => sum + Number(it?.quantity || 0), 0);

  const formatDate = (ms) => {
    if (!ms) return "-";
    const d = new Date(ms);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatAddress = (a) => {
    if (!a) return "-";
    const fullName = [a.firstName, a.lastName].filter(Boolean).join(" ");
    return {
      fullName,
      email: a.email || "-",
      phone: a.phone || "-",
      line1: a.street || "-",
      line2: [a.city, a.state, a.zipcode].filter(Boolean).join(", ") || "-",
      country: a.country || "-",
    };
  };

    const fetchAllOrders = async () => {
      if (!token) {
        setOrders([]);
        return;
      }

      try {

        const res = await fetch(`${backendURL}/order/list`, {
          method: "POST",
          headers: { token },
        });

        console.log("[AdminOrders] status:", res.status);
        const data = await res.json();

        console.log(data.orders)

        if (data.success) {
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        } else {
          toast.error(data.message);
          setOrders([]);
        }
      } catch (err) {
        console.log(err);
        toast.error(err.message);
        setOrders([]);
      }
    };

  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => Number(b?.date || 0) - Number(a?.date || 0));
  }, [orders]);

  const handleStatus = async (e, orderId) => {
    try {
      
      const res = await fetch(`${backendURL}/order/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ orderId, status:e.target.value }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        await fetchAllOrders()
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center" style={{ width: "100%" }}>
        <h1>Orders</h1>
      </div>

      {sortedOrders.length === 0 && <p className="mt-3">No orders found.</p>}

      {sortedOrders.map((order) => {
        const totalItems = getTotalItems(order);
        const addr = formatAddress(order?.address);

          return (
            <div key={order?._id} className="card p-3 mt-3 shadow-sm">
              {/* Summary header */}
              <div className="d-flex justify-content-between flex-wrap gap-3">
                <div>
                  <div className="fw-bold">Total items</div>
                  <div>{totalItems}</div>
                </div>

                <div>
                  <div className="fw-bold">Amount</div>
                  <div>${Number(order?.amount || 0).toFixed(2)}</div>
                </div>

                <div>
                  <div className="fw-bold">Payment Method</div>
                  <div>{order?.paymentMethod || "-"}</div>
                </div>

                <div>
                  <div className="fw-bold">Payment</div>
                  <div>{order?.payment ? "Done" : "Pending"}</div>
                </div>

                <div>
                  <div className="fw-bold">Date</div>
                  <div>{formatDate(order?.date)}</div>
                </div>

                <div style={{ minWidth: 210 }}>
                  <div className="fw-bold">Status</div>

                  <Form.Select onChange={(e) => handleStatus(e, order._id)} value={order.status} aria-label="Order Status">
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                  </Form.Select>
                </div>
              </div>

              <hr />

              {/* items + address */}
              <div className="row g-3">
                {/* items */}
                <div className="col-12 col-lg-7">
                  <div className="d-flex flex-column gap-2">
                    {(order?.items || []).map((item) => {
                      const imgSrc = item?.image?.[0] || productImg;

                      return (
                        <div
                          key={`${order?._id}-${item?._id}-${item?.size || "nosize"}`}
                          className="d-flex align-items-center justify-content-between"
                        >
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={imgSrc}
                              alt={item?.name || "product"}
                              width="45"
                              height="45"
                              style={{ objectFit: "cover", borderRadius: 8 }}
                              onError={(e) => (e.currentTarget.src = productImg)}
                            />

                            <div>
                              <div className="fw-semibold">{item?.name || "Unnamed product"}</div>
                              <div className="text-muted" style={{ fontSize: 13 }}>
                                x{Number(item?.quantity || 0)}{" "}
                                {item?.size ? `• Size: ${item.size}` : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* address */}
                <div className="col-12 col-lg-5">
                  <div className="border rounded p-3 h-100">
                    <div className="fw-bold mb-2">Address</div>

                    <div className="mb-1">{addr.fullName || "-"}</div>
                    <div className="text-muted mb-1" style={{ fontSize: 14 }}>
                      {addr.email}
                    </div>
                    <div className="text-muted mb-2" style={{ fontSize: 14 }}>
                      {addr.phone}
                    </div>

                    <div style={{ fontSize: 14 }}>{addr.line1}</div>
                    <div style={{ fontSize: 14 }}>{addr.line2}</div>
                    <div style={{ fontSize: 14 }}>{addr.country}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default AdminOrders;