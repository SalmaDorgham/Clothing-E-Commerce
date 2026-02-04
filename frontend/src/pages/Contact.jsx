import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import { backendURL } from "../App";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${backendURL}/contact/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, surname, email, subject, message }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setName("");
        setSurname("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (

    <>
    <h1 className='text-center sectionTitle' style={{marginTop: "2%"}}>Contact Us</h1>
    <div className="d-flex justify-content-center">
    <Form className="PM" style={{ width: "300px" }} onSubmit={handleSubmit}>
      
{/* Name */}
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Form.Group>

{/* Surname */}
      <Form.Group className="mb-3">
        <Form.Label>Surname</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter your surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
        />
      </Form.Group>

{/* Email */}
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Form.Group>

{/* Surname */}
      <Form.Group className="mb-3">
        <Form.Label>Message Subject</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter message subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </Form.Group>

{/* Message */}
      <Form.Group className="mb-3">
        <Form.Label>Message</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Write your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </Form.Group>

{/* Submit Button */}
      <Button
        variant="dark"
        style={{ width: "300px", marginBottom: "5%" }}
        type="submit"
      >
        Submit
      </Button>
    </Form>
    </div>
    </>
  );
};

export default ContactForm;
