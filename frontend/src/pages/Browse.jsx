import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Form from "react-bootstrap/Form";
import ProductCard from "../components/ProductCard";
import { backendURL } from "../App";
import { toast } from "react-toastify";

import Pagination from "../components/Pagination";
const ITEMS_PER_PAGE = 16;

const Browse = () => {
  //DECLARATIONS
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get("search") || "";
  const params = new URLSearchParams(location.search);
  const categoryFromLink = params.get("category");

  const [list, setList] = useState([]); //products
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortOption, setSortOption] = useState("");

  const [openCats, setOpenCats] = useState(false);
  const [openTypes, setOpenTypes] = useState(false);
  const [openColors, setOpenColors] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  // FILTER ARRAYS
  const categories = ["Men", "Women", "Kids"];
  const types = ["Top", "Bottom", "Accessories"];
  const colors = [
    "White",
    "Black",
    "Grey",
    "Brown",
    "Blue",
    "Green",
    "Red",
    "Orange",
    "Yellow",
    "Purple",
    "Pink",
    "Multicolor",
  ];

  const colorHex = {
    White: "#ffffff",
    Black: "#000000",
    Grey: "#808080",
    Brown: "#8b5a2b",
    Blue: "#1e90ff",
    Green: "#2e8b57",
    Red: "#e53935",
    Orange: "#fb8c00",
    Yellow: "#fdd835",
    Purple: "#8e24aa",
    Pink: "#ec407a",
    Multicolor: "linear-gradient(45deg, #ff1744, #ffea00, #00e676, #2979ff, #d500f9)",
  };

  const isSelected = (arr, value) => (arr || []).includes(value);


  // FETCH PRODUCTS
  const fetchList = async () => {
    try {
      const res = await fetch(`${backendURL}/product/list`);
      const data = await res.json();
      console.log(data);

      if (data.success) {
        setList(data.products);
        setLoading(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SORT & FILTER FROM VIEW ALL BUTTON (Home)
  useEffect(() => {
    if (categoryFromLink) {
      setSelectedCategories([categoryFromLink]);
      setOpenCats(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // TOGGLE helper
  const toggle = (value, setFn) => {
    setFn((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  let filteredProducts = list.filter((p) => {
    const matchCategory =
      !selectedCategories.length || selectedCategories.includes(p.category);
    const matchType = !selectedTypes.length || selectedTypes.includes(p.subCategory);
    const matchColor = !selectedColors.length || selectedColors.includes(p.color);
    return matchCategory && matchType && matchColor;
  });

  // SORTING
  if (sortOption === "best-seller") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.seller - a.seller);
  }
  if (sortOption === "new-old") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }
  if (sortOption === "high-low") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  }
  if (sortOption === "low-high") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  }

  // SEARCH QUERY
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedTypes, selectedColors, sortOption, searchQuery]);


  return (
    <>
      <h1 className="text-center sectionTitle" style={{ marginTop: "2%" }}>
        {" "}
        All Products
      </h1>

      <div className="row mt-4">
        {/* Filters */}
        <div className="col-lg-3 col-12">
          {/* Sort */}
          <div className="border p-3 mb-4">
            <h5>Sort</h5>
            <Form.Select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              aria-label="Sort products"
            >
              <option value="">Select</option>
              <option value="best-seller">Best Sellers</option>
              <option value="new-old">Latest Releases</option>
              <option value="high-low">Price: High to Low</option>
              <option value="low-high">Price: Low to High</option>
            </Form.Select>
          </div>

          {/* Categories */}
          <div className="border p-3 mb-4">
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => setOpenCats((v) => !v)}
            >
              <h5 className="m-0">Categories</h5>
              <i className={`bi ${openCats ? "bi-chevron-up" : "bi-chevron-down"}`} />
            </div>

            {openCats && (
              <Form className="mt-3">
                {categories.map((cat, i) => (
                  <Form.Check
                    key={i}
                    type="checkbox"
                    label={cat}
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggle(cat, setSelectedCategories)}
                  />
                ))}
              </Form>
            )}
          </div>

          {/* Type */}
          <div className="border p-3 mb-4">
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => setOpenTypes((v) => !v)}
            >
              <h5 className="m-0">Type</h5>
              <i className={`bi ${openTypes ? "bi-chevron-up" : "bi-chevron-down"}`} />
            </div>

            {openTypes && (
              <Form className="mt-3">
                {types.map((t, i) => (
                  <Form.Check
                    key={i}
                    type="checkbox"
                    label={t}
                    checked={selectedTypes.includes(t)}
                    onChange={() => toggle(t, setSelectedTypes)}
                  />
                ))}
              </Form>
            )}
          </div>

          {/* Color */}
          <div className="border p-3 mb-4">
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => setOpenColors((v) => !v)}
            >
              <h5 className="m-0">Color</h5>
              <i className={`bi ${openColors ? "bi-chevron-up" : "bi-chevron-down"}`} />
            </div>

            {openColors && (
              <div className="mt-3 d-flex flex-wrap gap-2">
                {colors.map((c) => {
                  const selected = isSelected(selectedColors, c);
                  const swatch = colorHex[c] || "#ddd";
                  const isGradient = typeof swatch === "string" && swatch.startsWith("linear-gradient");

                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggle(c, setSelectedColors)}
                      title={c}
                      className="d-flex align-items-center gap-2"
                      style={{
                        border: selected ? "2px solid #000" : "1px solid #d0d0d0",
                        borderRadius: 999,
                        padding: "6px 10px",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        aria-label={c}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: c === "White" ? "1px solid #cfcfcf" : "1px solid transparent",
                          background: isGradient ? undefined : swatch,
                          backgroundImage: isGradient ? swatch : undefined,
                          display: "inline-block",
                        }}
                      />
                      <span style={{ fontSize: 14 }}>{c}</span>

                      {selected && (
                        <i className="bi bi-check2" style={{ fontSize: 16, marginLeft: 2 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>


        </div>

        {/* Products */}
        <div className="col-lg-9 col-12">
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
            {loading && <p className="mt-3">Loading...</p>}

            {!loading && filteredProducts.length === 0 && (
              <p className="mt-3">No products found.</p>
            )}

            {!loading &&
              paginatedProducts.map((p, index) => (
                <div className="col" key={index}>
                  <ProductCard
                    id={p._id}
                    title={p.name}
                    image={p.image?.[0]}
                    price={p.price}
                  />
                </div>
              ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

        </div>

      </div>
    </>
  );
};

export default Browse;
