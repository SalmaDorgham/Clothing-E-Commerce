import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import "../assets/css/Header.css";
import { backendURL } from "../App";

const Header = ({ token, setToken }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const isBrowse = location.pathname === "/browse";

  // logout
  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    setCartCount(0);
    toast.success("Logged out Successfully, See you soon!");
    navigate("/");
  };

  // synced input only on browse path
  useEffect(() => {
    if (!isBrowse) return;
    const q = new URLSearchParams(location.search).get("search") || "";
    setSearch(q);
  }, [isBrowse, location.search]);

  useEffect(() => {
    if (!isBrowse) return;

    const t = setTimeout(() => {
      const trimmed = search.trim();
      if (trimmed) {
        navigate(`/browse?search=${encodeURIComponent(trimmed)}`, { replace: true });
      } else {
        navigate("/browse", { replace: true });
      }
    }, 250);

    return () => clearTimeout(t);
  }, [search, isBrowse, navigate]);

  // NOT on /browse => navigate only on Enter/icon click
  const submitSearch = () => {
    const trimmed = search.trim();
    if (trimmed) navigate(`/browse?search=${encodeURIComponent(trimmed)}`);
    else navigate("/browse");
  };

  // fetch cart
  const fetchCartCount = async () => {
    if (!token) {
      setCartCount(0);
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

      if (!data?.success) {
        setCartCount(0);
        return;
      }

      const cartData = data.cartData || {};

      const count = Object.values(cartData).reduce(
        (sum, sizes) =>
          sum +
          Object.values(sizes || {}).reduce((s, q) => s + Number(q || 0), 0),
        0
      );

      setCartCount(count);
    } catch (err) {
      console.log(err);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const onCartUpdated = () => fetchCartCount();
    window.addEventListener("cart:updated", onCartUpdated);
    return () => window.removeEventListener("cart:updated", onCartUpdated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <>
      <nav className="header-container">
        {/* TOP ROW (Logo + Nav links) */}
        <div className="top-row px-3 px-sm-4 px-md-5 px-lg-5 pt-2 pb-2">
          {/* LEFT: Logo */}
          <div className="left-section">
            <Link to="/" className="navbar-brand">
              <h1>Fashion</h1>
            </Link>
          </div>

          {/* CENTER NAV LINKS */}
          <ul className="nav-links nav-center d-none d-md-flex">
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact">Contact</NavLink>
            </li>
            <li>
              <NavLink to="/browse">Collection</NavLink>
            </li>
          </ul>

          {/* RIGHT SIDE*/}
          <div className="nav-right d-none d-md-flex">
            {!token ? (
              <Link to="/login">
                <Button className="logout-btn" variant="dark" type="button">
                  Login
                </Button>
              </Link>
            ) : (
              <Button
                onClick={handleLogout}
                className="logout-btn"
                variant="dark"
                type="button"
              >
                Logout
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <i
            className="bi bi-list d-md-none menu-btn"
            onClick={() => setOpen(true)}
          />
        </div>

        {/* SECOND ROW */}
        <div className="icons">
          <div className="search-box">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (!isBrowse && e.key === "Enter") submitSearch();
              }}
            />
            <i
              className="bi bi-search fs-5"
              onClick={() => {
                if (!isBrowse) submitSearch();
              }}
              style={{ cursor: "pointer" }}
            />
          </div>

          <Link to="/cart" className="cart-icon-wrapper">
            <i className="bi bi-cart3 fs-5"></i>

            {token && cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </Link>

          <Link to="/orders" style={{ textDecoration: "none" }}>
            <i className="bi bi-box-seam icons"></i>
          </Link>
        </div>
      </nav>

      {/* Mobile Slide Menu */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <div className="menu-header">
          <i
            className="bi bi-x-lg close-btn"
            onClick={() => setOpen(false)}
          ></i>
        </div>

        <ul className="mobile-links text-center">
          <li>
            <NavLink to="/" end onClick={() => setOpen(false)}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" onClick={() => setOpen(false)}>
              Contact
            </NavLink>
          </li>
          <li>
            <NavLink to="/browse" onClick={() => setOpen(false)}>
              Collection
            </NavLink>
          </li>
          <li>
            {!token ? (
              <Link to="/login">
                <Button className="logout-btn" variant="dark" type="button">
                  Login
                </Button>
              </Link>
            ) : (
              <Button
                onClick={handleLogout}
                className="logout-btn"
                variant="dark"
                type="button"
              >
                Logout
              </Button>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Header;
