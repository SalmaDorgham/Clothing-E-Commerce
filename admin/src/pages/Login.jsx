import React, {useState} from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
//import axios from 'axios'
import "../assets/css/Layout.css";
import {backendURL} from "../App";
import {toast} from 'react-toastify'

const Login = ({setToken}) => {

    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        
        try {            
            const res = await fetch(`${backendURL}/user/admin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: pwd }),
            });

            const data = await res.json();

            console.log(data);
            console.log(data.token);

            if (data.success) {
                setToken(data.token)
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

  return (
    <>
        <div className="topbar">
            <div>
            <h1>Fashion</h1>
            <div className="brand-sub">ADMIN PANEL</div>
            </div>
        </div>

        <hr />

        <div>
            <h1 className="text-center sectionTitle" style={{ marginTop: "2%" }}>
                Log In
            </h1>

            <div className="d-flex justify-content-center">
                <Form className="PM" style={{ width: "300px" }} onSubmit={handleSubmit}>
{/* Email */}
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />
                    </Form.Group>
{/* Password */}
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                        type="password"
                        placeholder="Enter Password"
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        required
                        />

                    </Form.Group>
{/* BUTTON */}
                    <Button
                        variant="dark"
                        style={{ width: "300px", marginBottom: "5%" }}
                        type="submit"
                    >
                        Log In
                    </Button>
                </Form>
            </div>

        </div>
    </>
  )
}

export default Login