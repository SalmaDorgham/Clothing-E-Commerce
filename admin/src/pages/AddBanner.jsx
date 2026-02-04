import React, { useCallback, useMemo, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Cropper from "react-easy-crop";
import { toast } from "react-toastify";
import { backendURL } from "../App";
import addImg from "../assets/images/addImage.png";

// banner size
const TARGET_W = 2200;
const TARGET_H = 950;
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
    outCanvas.toBlob(
      (blob) => resolve(blob),
      "image/jpeg",
      0.92
    );
  });
}

const AddBanner = ({ token }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [rawFile, setRawFile] = useState(null);
  const [rawPreview, setRawPreview] = useState(null);

  const [croppedFile, setCroppedFile] = useState(null);
  const [croppedPreview, setCroppedPreview] = useState(null);

  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const previewToShow = useMemo(() => croppedPreview || rawPreview, [croppedPreview, rawPreview]);

  const onPickImage = (file) => {
    if (!file) return;

    if (rawPreview) URL.revokeObjectURL(rawPreview);
    if (croppedPreview) URL.revokeObjectURL(croppedPreview);

    const url = URL.createObjectURL(file);
    setRawFile(file);
    setRawPreview(url);
    setCroppedFile(null);
    setCroppedPreview(null);

    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setShowCrop(true);
  };

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const confirmCrop = async () => {
    try {
      if (!rawPreview || !croppedAreaPixels) return toast.error("Crop area not ready.");

      const blob = await getCroppedResizedBlob(rawPreview, croppedAreaPixels);
      if (!blob) return toast.error("Failed to crop image.");

      const file = new File([blob], `banner-${Date.now()}.jpg`, { type: "image/jpeg" });

      const croppedUrl = URL.createObjectURL(file);

      if (croppedPreview) URL.revokeObjectURL(croppedPreview);
      setCroppedFile(file);
      setCroppedPreview(croppedUrl);

      setShowCrop(false);
    } catch (e) {
      console.log(e);
      toast.error("Cropping failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!croppedFile) {
        return toast.error("Please crop the image to 2200×950 before submitting.");
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("image", croppedFile);

      const res = await fetch(`${backendURL}/banner/add`, {
        method: "POST",
        headers: { token },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);

        // reset
        setName("");
        setStartDate("");
        setEndDate("");

        if (rawPreview) URL.revokeObjectURL(rawPreview);
        if (croppedPreview) URL.revokeObjectURL(croppedPreview);

        setRawFile(null);
        setRawPreview(null);
        setCroppedFile(null);
        setCroppedPreview(null);
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
      <h1>Add Banner</h1>

      <Form onSubmit={handleSubmit} style={{ float: "left" }}>
        <Form.Group className="mb-3">
          <Form.Label>Upload Banner Image (must be 2200×950)</Form.Label>

          <div className="d-flex gap-3 flex-wrap align-items-center">
            <Form.Label htmlFor="bannerImage" style={{ cursor: "pointer" }}>
              <img
                src={previewToShow || addImg}
                alt="banner"
                style={{
                  width: "240px",
                  height: "104px",
                  objectFit: "cover",
                  border: "1px dashed #ccc",
                  borderRadius: "8px",
                }}
              />
              <Form.Control
                type="file"
                id="bannerImage"
                hidden
                accept="image/*"
                onChange={(e) => onPickImage(e.target.files?.[0] || null)}
              />
            </Form.Label>

            {rawFile && (
              <Button variant="outline-dark" type="button" onClick={() => setShowCrop(true)}>
                Adjust Crop
              </Button>
            )}
          </div>

          <div className="text-muted mt-2" style={{ fontSize: 13 }}>
            Tip: Choose the part of the image you want to show. It will be saved exactly 2200×950.
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Banner name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Banner Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Starting date</Form.Label>
          <Form.Control type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Ending date</Form.Label>
          <Form.Control type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </Form.Group>

        <Button variant="dark" style={{ width: "300px", marginBottom: "5%" }} type="submit">
          Add Banner
        </Button>
      </Form>

      {/* Crop Modal */}
      <Modal show={showCrop} onHide={() => setShowCrop(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crop Banner (2200×950)</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div style={{ position: "relative", width: "100%", height: 420, background: "#111" }}>
            {rawPreview && (
              <Cropper
                image={rawPreview}
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

export default AddBanner;
