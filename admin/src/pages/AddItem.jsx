import React, { useCallback, useMemo, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Cropper from "react-easy-crop";
import addImg from "../assets/images/addImage.png";
import "../assets/css/AddItem.css";
import { backendURL } from "../App";
import { toast } from "react-toastify";

const categories = ["Men", "Women", "Kids"];
const types = ["Top", "Bottom", "Accessories"];
const colors = ["White", "Black", "Grey", "Brown", "Blue", "Green", "Red","Orange", "Yellow","Purple", "Pink", "Multicolor"];
const sizes = ["XS","S", "M", "L", "XL", "XXL"];

// image size
const TARGET_W = 390;
const TARGET_H = 450;
const ASPECT = TARGET_W / TARGET_H;

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });

// crop + resize
async function getCroppedResizedBlob(imageSrc, cropPixels) {
  const image = await createImage(imageSrc);

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = cropPixels.width;
  cropCanvas.height = cropPixels.height;

  const cropCtx = cropCanvas.getContext("2d");
  cropCtx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  const outCanvas = document.createElement("canvas");
  outCanvas.width = TARGET_W;
  outCanvas.height = TARGET_H;

  const outCtx = outCanvas.getContext("2d");
  outCtx.drawImage(cropCanvas, 0, 0, TARGET_W, TARGET_H);

  return new Promise((resolve) => {
    outCanvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
}

const AddItem = ({ token }) => {
  const [images, setImages] = useState({
    image1: { rawFile: null, rawPreview: null, file: null, preview: null },
    image2: { rawFile: null, rawPreview: null, file: null, preview: null },
    image3: { rawFile: null, rawPreview: null, file: null, preview: null },
    image4: { rawFile: null, rawPreview: null, file: null, preview: null },
  });

  const imageKeys = ["image1", "image2", "image3", "image4"];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("20");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubcategory] = useState("Top");
  const [color, setColor] = useState("Multicolor");

  const [selectedSize, setSelectedSize] = useState([]);
  const toggleSize = (size) => {
    setSelectedSize((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const [showCrop, setShowCrop] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const activeRawPreview = useMemo(() => {
    if (!activeKey) return null;
    return images[activeKey]?.rawPreview || null;
  }, [activeKey, images]);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const openCropFor = (key) => {
    if (!images[key]?.rawPreview) return;
    setActiveKey(key);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setShowCrop(true);
  };

  const onPickImage = (key, file) => {
    if (!file) return;

    setImages((prev) => {
      const old = prev[key];
      if (old?.rawPreview) URL.revokeObjectURL(old.rawPreview);
      if (old?.preview) URL.revokeObjectURL(old.preview);

      const rawPreview = URL.createObjectURL(file);

      return {
        ...prev,
        [key]: {
          rawFile: file,
          rawPreview,
          file: null,
          preview: null,
        },
      };
    });

    setActiveKey(key);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setShowCrop(true);
  };

  const confirmCrop = async () => {
    try {
      if (!activeKey) return toast.error("No image selected.");
      const src = images[activeKey]?.rawPreview;
      if (!src || !croppedAreaPixels) return toast.error("Crop area not ready.");

      const blob = await getCroppedResizedBlob(src, croppedAreaPixels);
      if (!blob) return toast.error("Failed to crop image.");

      const file = new File([blob], `${activeKey}-${Date.now()}.jpg`, { type: "image/jpeg" });
      const preview = URL.createObjectURL(file);

      setImages((prev) => {
        const oldPreview = prev[activeKey]?.preview;
        if (oldPreview) URL.revokeObjectURL(oldPreview);

        return {
          ...prev,
          [activeKey]: {
            ...prev[activeKey],
            file,
            preview,
          },
        };
      });

      setShowCrop(false);
    } catch (e) {
      console.log(e);
      toast.error("Cropping failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasAtLeastOneImage = imageKeys.some(
      (key) => images[key]?.file || images[key]?.rawFile
    );

    if (!hasAtLeastOneImage) {
      toast.error("Please upload at least one product image.");
      return;
    }

    if (!selectedSize || selectedSize.length === 0) {
      toast.error("Please select at least one size.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("color", color);
      formData.append("price", price);
      formData.append("sizes", JSON.stringify(selectedSize));

      imageKeys.forEach((key) => {
        const slot = images[key];
        const fileToUpload = slot?.file || slot?.rawFile;
        if (fileToUpload) formData.append(key, fileToUpload);
      });

      const res = await fetch(`${backendURL}/product/add`, {
        method: "POST",
        headers: { token },
        body: formData,
      });

      const data = await res.json();
      console.log(data);

      if (data.success) {
        toast.success(data.message);

        Object.values(images).forEach((slot) => {
          slot?.rawPreview && URL.revokeObjectURL(slot.rawPreview);
          slot?.preview && URL.revokeObjectURL(slot.preview);
        });

        setImages({
          image1: { rawFile: null, rawPreview: null, file: null, preview: null },
          image2: { rawFile: null, rawPreview: null, file: null, preview: null },
          image3: { rawFile: null, rawPreview: null, file: null, preview: null },
          image4: { rawFile: null, rawPreview: null, file: null, preview: null },
        });

        setName("");
        setDescription("");
        setPrice("20");
        setCategory("Men");
        setSubcategory("Top");
        setColor("Multicolor");
        setSelectedSize([]);
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
      <h1>Add Product</h1>

      <Form onSubmit={handleSubmit} style={{ float: "left" }}>
        <Form.Group className="mb-3">
          <Form.Label>Upload Image (will be cropped to 390×450)</Form.Label>

          <div className="d-flex gap-3 flex-wrap align-items-start">
            {imageKeys.map((key) => {
              const slot = images[key];
              const showSrc = slot?.preview || slot?.rawPreview || addImg;

              return (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Form.Label htmlFor={key} style={{ cursor: "pointer", marginBottom: 0 }}>
                    <img
                      src={showSrc}
                      alt="upload"
                      style={{
                        width: "90px",
                        height: "90px",
                        objectFit: "cover",
                        border: "1px dashed #ccc",
                        borderRadius: "8px",
                      }}
                    />

                    <Form.Control
                      type="file"
                      id={key}
                      hidden
                      accept="image/*"
                      onChange={(e) => onPickImage(key, e.target.files?.[0] || null)}
                    />
                  </Form.Label>

                  {slot?.rawFile && (
                    <Button
                      variant="outline-dark"
                      size="sm"
                      type="button"
                      onClick={() => openCropFor(key)}
                    >
                      Adjust Crop
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-muted mt-2" style={{ fontSize: 13 }}>
            Tip: After selecting an image, crop it to choose the best area. Final saved size is 390×450.
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Product name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Product Name"
            required
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Product description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter Product Description"
            required
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Product categories</Form.Label>

          <div className="d-flex gap-3">
            <Form.Select className="w-100" onChange={(e) => setCategory(e.target.value)} value={category}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Select>

            <Form.Select className="w-100" onChange={(e) => setSubcategory(e.target.value)} value={subCategory}>
              <option value="">Select type</option>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Form.Select>

            <Form.Select className="w-100" onChange={(e) => setColor(e.target.value)} value={color}>
              <option value="">Select color</option>
              {colors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Select>
          </div>
        </Form.Group>

        <Form.Group className="w-25 mb-3">
          <Form.Label>Product price</Form.Label>
          <Form.Control
            type="number"
            placeholder="20"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Product Sizes</Form.Label>

          <div className="d-flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <div
                key={size}
                className={`size-pill ${selectedSize.includes(size) ? "active" : ""}`}
                onClick={() => toggleSize(size)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && toggleSize(size)}
              >
                {size}
              </div>
            ))}
          </div>
        </Form.Group>

        <Button variant="dark" style={{ width: "300px", marginBottom: "5%" }} type="submit">
          Add Item
        </Button>
      </Form>

      {/* Crop Modal */}
      <Modal show={showCrop} onHide={() => setShowCrop(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crop Product Image ({TARGET_W}×{TARGET_H})</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div style={{ position: "relative", width: "100%", height: 420, background: "#111" }}>
            {activeRawPreview && (
              <Cropper
                image={activeRawPreview}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                restrictPosition={false}
              />
            )}
          </div>

          <div className="mt-3 d-flex align-items-center gap-3">
            <div style={{ width: 70 }}>Zoom</div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" type="button" onClick={() => setShowCrop(false)}>
            Cancel
          </Button>
          <Button variant="dark" type="button" onClick={confirmCrop}>
            Save Crop
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddItem;
