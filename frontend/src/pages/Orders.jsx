import React, { useEffect, useMemo, useState } from "react";
import productImg from "../assets/images/product.png";
import { backendURL } from "../App";
import { toast } from "react-toastify";

const Orders = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  // total items
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

  const fetchOrders = async () => {
    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${backendURL}/order/userorders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
      });

      const data = await res.json();

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => Number(b?.date || 0) - Number(a?.date || 0));
  }, [orders]);

  const STATUS_COLOR = {
    "Order Placed": "Silver",
    Packing: "SlateBlue",
    Shipped: "orange",
    "Out for delivery": "Khaki",
    Delivered: "LightGreen",
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center" style={{ width: "100%" }}>
        <h1>My Orders</h1>
      </div>

      {loading && <p className="mt-3">Loading...</p>}

      {!loading && sortedOrders.length === 0 && <p className="mt-3">You have no orders yet.</p>}

      {!loading &&
        sortedOrders.map((order) => {
          const totalItems = getTotalItems(order);

          return (
            <div key={order?._id} className="card p-3 mt-3 shadow-sm">
              {/* Order summary */}
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
                  <div className="fw-bold">Date</div>
                  <div>{formatDate(order?.date)}</div>
                </div>

                <div>
                  <div className="fw-bold">Status</div>
                  <div className="d-flex align-items-center gap-2">
                    <i
                      className="bi bi-circle-fill"
                      style={{
                        color: STATUS_COLOR[order?.status] || "grey",
                        fontSize: 10,
                      }}
                    />
                    <span>{order?.status || "-"}</span>
                  </div>
                </div>
              </div>

              <hr />

              {/* Order items list */}
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
                            x{Number(item?.quantity || 0)} &nbsp;{" "}
                            {item?.size ? `Size: ${item.size}` : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default Orders;