import React, { useState, useEffect } from 'react'
import productImg from '../assets/images/product.png';
import { backendURL } from "../App";
import { toast } from 'react-toastify'
import Pagination from './Pagination';

const ITEMS_PER_PAGE = 20;

const Items = ({ token }) => {

  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // FETCH PRODUCTS
  const fetchList = async () => {
    try {
      const res = await fetch(`${backendURL}/product/list`);
      const data = await res.json();

      if (data.success) {
        setList(data.products);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [list.length]);

  // REMOVE PRODUCT
  const removeProduct = async (id) => {
    try {
      const res = await fetch(`${backendURL}/product/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        await fetchList();
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE);

  const paginatedItems = list.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <h1>All Products</h1>

      <table className="table">
        <thead>
          <tr style={{ backgroundColor: "#939393", fontWeight: "bold" }}>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {paginatedItems.map((product) => {
            const imgSrc = product.image?.[0] || productImg;

            return (
              <tr key={product._id}>
                <td style={{ width: "110px" }}>
                  <img
                    src={imgSrc}
                    alt={product.name}
                    width="100"
                    height="100"
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                </td>

                <td>
                  <h6 className="mb-0">{product.name}</h6>
                </td>

                <td>
                  <h6 className="mb-0">
                    {product.category} <br />
                    {product.subCategory} <br />
                    {product.color}
                  </h6>
                </td>

                <td>
                  <h6 className="mb-0">{product.price}$</h6>
                </td>

                <td>
                  <i
                    className="bi bi-trash3-fill"
                    style={{ cursor: "pointer" }}
                    onClick={() => removeProduct(product._id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
};

export default Items;