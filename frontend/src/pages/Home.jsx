import React, { useState, useEffect, useRef } from 'react'
import { Link } from "react-router-dom";
import Carousel from 'react-bootstrap/Carousel';
import Card from 'react-bootstrap/Card';
import ProductCard from '../components/ProductCard';
import Button from 'react-bootstrap/Button';
import {backendURL} from "../App";
import {toast} from 'react-toastify'
import dummyBanner from '../assets/images/banner1.jpeg'
import menImg from '../assets/images/men.png'
import womenImg from '../assets/images/women.png'
import kidsImg from '../assets/images/kids.png'
import '../assets/css/Home.css'

const Home = () => {

const [list, setList] = useState ([]) //products
const [loading, setLoading] = useState(true);

const [banners, setBanners] = useState([]);
const [bannerLoading, setBannerLoading] = useState(true);

// FETCH RRODUCTS
  const fetchList = async () => {
    try {
      const res = await fetch(`${backendURL}/product/list`);
      const data = await res.json();
      console.log(data);

      if (data.success) {
        setList(data.products)
        setLoading(false);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  useEffect (()=>{
      fetchList()
  },[])

  // FETCH ACTIVE BANNERS
  const fetchBanners = async () => {
    try {
      const res = await fetch(`${backendURL}/banner/active`);
      const data = await res.json();

      if (data.success) setBanners(data.banners);
      else toast.error(data.message);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setBannerLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    fetchBanners();
  }, []);

  // Best sellers

  const buckets = [
    { category: "Men", subCategory: "Top" },
    { category: "Women", subCategory: "Top" },
    { category: "Kids", subCategory: "Top" },
    { category: "Men", subCategory: "Bottom" },
    { category: "Women", subCategory: "Bottom" },
    { category: "Kids", subCategory: "Bottom" },
  ];
  // whole list sorted
  const sorted = [...list].sort((a, b) => (b.seller || 0) - (a.seller || 0));
  // top 2 of each bucket
  const pickedByBucket = buckets.map(({ category, subCategory }) =>
    sorted
      .filter((p) => p.category === category && p.subCategory === subCategory)
      .slice(0, 2)
  );
  // ordered
  const bestSellers = [0, 1].flatMap((i) =>
    pickedByBucket.map((arr) => arr[i]).filter(Boolean)
  );
  // accessories buckets
  const accBuckets = [
    { category: "Men", subCategory: "Accessories" },
    { category: "Women", subCategory: "Accessories" },
    { category: "Kids", subCategory: "Accessories" },
  ];
  // top 4 of each
  const accPickedByBucket = accBuckets.map(({ category, subCategory }) =>
    sorted
      .filter((p) => p.category === category && p.subCategory === subCategory)
      .slice(0, 4)
  );
  // ordered
  const peopleAlsoBought = [0, 1, 2, 3].flatMap((i) =>
    accPickedByBucket.map((arr) => arr[i]).filter(Boolean)
  );

  const displayBanners =
    !bannerLoading && banners.length > 0
      ? banners.map(b => ({
          src: b.image,
          alt: b.name,
          key: b._id
        }))
      : [
          {
            src: dummyBanner,
            alt: "Promotional Banner",
            key: "dummy-banner"
          }
        ];

  // best seller scroll

  const scrollRef = useRef(null);
  const autoScrollRef = useRef(true);
  const intervalRef = useRef(null);
  const CARD_WIDTH = 280;

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({
      left: -CARD_WIDTH,
      behavior: "smooth",
    });
  };
 
  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: CARD_WIDTH,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!autoScrollRef.current || !scrollRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      // loop back at end
      if (scrollLeft + clientWidth >= scrollWidth - 5) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRight();
      }
    }, 3500);

    return () => clearInterval(intervalRef.current);
  }, []);

  // also bought scroll

  const scrollRefAcc = useRef(null);
  const autoScrollAccRef = useRef(true);

  const ACC_CARD_WIDTH = 280;

  const scrollLeftAcc = () => {
    scrollRefAcc.current?.scrollBy({ left: -ACC_CARD_WIDTH, behavior: "smooth" });
  };

  const scrollRightAcc = () => {
    scrollRefAcc.current?.scrollBy({ left: ACC_CARD_WIDTH, behavior: "smooth" });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!autoScrollAccRef.current || !scrollRefAcc.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollRefAcc.current;

      if (scrollLeft + clientWidth >= scrollWidth - 5) {
        scrollRefAcc.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRightAcc();
      }
    }, 3500);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className='container text-center' >

    {/* Banners */}
    <Carousel data-bs-theme="dark">
      {displayBanners.map((b) => (
        <Carousel.Item key={b.key}>
          <img
            src={b.src}
            className="d-block w-100"
            alt={b.alt}
          />
        </Carousel.Item>
      ))}
    </Carousel>
    <hr />

{/* Categories */}

    <div className='PM'>
      <h2 className='sectionTitle'>Explore Our Collection</h2>

      <div className="cards-row">
        {[
          { title: "Men", img: menImg, category: "Men" },
          { title: "Women", img: womenImg, category: "Women" },
          { title: "Kids", img: kidsImg, category: "Kids" },
        ].map(({ title, img, category }) => (
          <Link
            key={category}
            to={`/browse?category=${category}`}
            className="card-link"
          >
            <Card className="card-img-wrapper text-white">
              <Card.Img src={img} alt={title} className="image-zoom" />
              <div className="dark-overlay" />
              <Card.ImgOverlay className="card-overlay-center">
                <Card.Title>{title}</Card.Title>
              </Card.ImgOverlay>
            </Card>
          </Link>
        ))}
      </div>

    </div>

    <hr />

{/* best sellerss */}
      <div className="PM">
        <h2 className="sectionTitle">Best Sellers</h2>

        {loading && <p className="mt-3">Loading...</p>}

        {!loading && (
          <div className="carousel-wrapper">
            {/* Left Arrow */}
            <button
              className="carousel-arrow left"
              onClick={() => scrollLeft()}
              aria-label="Scroll left"
            >
              <i className="bi bi-caret-left-fill"></i>
            </button>

            {/* Scroll container */}
            <div className="best-sellers-scroll" 
              ref={scrollRef}
              onMouseEnter={() => (autoScrollRef.current = false)}
              onMouseLeave={() => (autoScrollRef.current = true)}
              onTouchStart={() => (autoScrollRef.current = false)}
              onTouchEnd={() => (autoScrollRef.current = true)}
            >
              {bestSellers.map((p) => (
                <div className="best-sellers-item" key={p._id}>
                  <ProductCard
                    id={p._id}
                    title={p.name}
                    image={p.image?.[0]}
                    price={p.price}
                  />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              className="carousel-arrow right"
              onClick={() => scrollRight()}
              aria-label="Scroll right"
            >
              <i className="bi bi-caret-right-fill"></i>
            </button>
          </div>
        )}
      </div>

{/* People also bought */}
      <div className="PM">
        <h4 className="sectionTitle">People Also Bought</h4>

        {loading && <p className="mt-3">Loading...</p>}

        {!loading && (
          <div className="carousel-wrapper">
            <button className="carousel-arrow left" onClick={scrollLeftAcc} aria-label="Scroll left">
              <i className="bi bi-caret-left-fill"></i>
            </button>

            <div
              className="best-sellers-scroll"
              ref={scrollRefAcc}
              onMouseEnter={() => (autoScrollAccRef.current = false)}
              onMouseLeave={() => (autoScrollAccRef.current = true)}
              onTouchStart={() => (autoScrollAccRef.current = false)}
              onTouchEnd={() => (autoScrollAccRef.current = true)}
            >
              {peopleAlsoBought.map((p) => (
                <div className="best-sellers-item" key={p._id}>
                  <ProductCard id={p._id} title={p.name} image={p.image?.[0]} price={p.price} />
                </div>
              ))}
            </div>

            <button className="carousel-arrow right" onClick={scrollRightAcc} aria-label="Scroll right">
              <i className="bi bi-caret-right-fill"></i>
            </button>
          </div>
        )}
      </div>


{/* general info */}

      <div className='row PM'>
        <div className='col'>
          <h1 className='infoh1'><i className="bi bi-arrow-repeat"></i> </h1>
          <p className='infop1'>Easy exchange & return</p>
          <p className='infop2'>Lorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem Ipsum</p>
        </div>
        <div className='col'>
          <h1 className='infoh1'><i className="bi bi-truck"></i> </h1>
          <p className='infop1'>Worldwide delivery</p>
          <p className='infop2'>Lorem IpsumLorem IpsumLorem Ipsum</p>
        </div>
        <div className='col'>
          <h1 className='infoh1'><i className="bi bi-headset"></i> </h1>
          <p className='infop1'>Always on the line</p>
          <p className='infop2'>Lorem IpsumLorem IpsumLorem IpsumLorem Ipsum</p>
        </div>
      </div>

{/* email service */}

      <h3>Subscribe for XXX YYY ZZZ</h3>
      <p className='infop2'>Lorem IpsumLorem IpsumLorem IpsumLorem Ipsum</p>
      <form className="d-flex" style={{justifyContent:"center"}}>
        <input className="form-control me-2" type="text" placeholder="you@example.com" style={{width:"50%"}}/>
        <Button variant="dark" type="submit">submit</Button>
      </form>

    </div>
  );
};

export default Home;