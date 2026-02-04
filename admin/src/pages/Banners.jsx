import React, { useEffect, useState } from "react";
import productImg from "../assets/images/product.png";
import { backendURL } from "../App";
import { toast } from "react-toastify";

const AdminBanners = ({ token }) => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const res = await fetch(`${backendURL}/banner/list`);
      const data = await res.json();

      if (data.success) setList(data.banners);
      else toast.error(data.message);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const toggleEnabled = async (id, currentEnabled) => {
    try {
      const res = await fetch(`${backendURL}/banner/update-enabled`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({ id, enabled: !currentEnabled }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Banner status updated");
        await fetchList();
      } else toast.error(data.message);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeBanner = async (id) => {
    try {
      const res = await fetch(`${backendURL}/banner/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        await fetchList();
      } else toast.error(data.message);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const formatDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? "-" : dt.toLocaleDateString();
  };

  return (
    <>
      <h1>All Banners</h1>

      <table className="table">
        <thead>
          <tr style={{ backgroundColor: "#939393", fontWeight: "bold" }}>
            <th>Image</th>
            <th>Name</th>
            <th>Date Range</th>
            <th>Enabled</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {list.map((b) => {
            const imgSrc = b.image || productImg;

            return (
              <tr key={b._id}>
                <td style={{ width: "110px" }}>
                  <img
                    src={imgSrc}
                    alt={b.name}
                    width="122"
                    height="53"
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                </td>

                <td>
                  <h6 className="mb-0">{b.name}</h6>
                </td>

                <td>
                  <h6 className="mb-0">
                    {formatDate(b.startDate)} <br /> {formatDate(b.endDate)}
                  </h6>
                </td>

                <td>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={!!b.enabled}
                      onChange={() => toggleEnabled(b._id, b.enabled)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </td>

                <td>
                  <i
                    className="bi bi-trash3-fill"
                    style={{ cursor: "pointer" }}
                    onClick={() => removeBanner(b._id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default AdminBanners;
