import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {useNavigate } from 'react-router-dom';
import {backendURL} from "../App";
import {toast} from 'react-toastify'

//const API_URL = "http://localhost:8000/users";

const Login = ({setToken}) => {
  const navigate = useNavigate();

  // MODES: "login" | "signup" | "reset"
  const [mode, setMode] = useState("login");

  // FORM FIELDS
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [cpwd, setCpwd] = useState("");

  // ========================================
  // LOGIN
  // ========================================

  const handleLogin = async (e) => {
    e.preventDefault(); 
          
    try {            
      const res = await fetch(`${backendURL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });
  
      const data = await res.json();
  
      console.log(data);
      console.log(data.message);
      const tokenFromRes = data.token || data.message;
  
      if (data.success) {
          setToken(tokenFromRes)
          toast.success("Logged in Successfully, Welcome!")
          navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  // ========================================
  // SIGNUP
  // ========================================

  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {            
      const res = await fetch(`${backendURL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd, confirmPassword: cpwd }),
      });
  
      const data = await res.json();
  
      console.log(data);
      console.log(data.message);
      const tokenFromRes = data.token || data.message;
  
      if (data.success) {
        if (!tokenFromRes || tokenFromRes === "undefined") {
          toast.error("Signup succeeded but token was not returned. Please log in.");
          navigate("/login");
          return;
        }
          setToken(tokenFromRes);
          toast.success("Account created Successfully!")
          navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  // ========================================
  // RESET PASSWORD
  // ========================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${backendURL}/user/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: pwd, confirmPassword: cpwd }),
      });

      const data = await res.json();
  
      console.log(data);
      console.log(data.token);
  
      if (data.success) {
          toast.success("Reset password Successfully!")
          setMode("login")
          setPwd("");
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  // ========================================
  // SUBMIT HANDLER
  // ========================================
  const handleSubmit = (e) => {
    if (mode === "login") return handleLogin(e);
    if (mode === "signup") return handleSignup(e);
    if (mode === "reset") return handleResetPassword(e);
  };

  return (
    <>
{/* TITLE */}
      <h1 className="text-center sectionTitle" style={{ marginTop: "2%" }}>
        {mode === "login" && "Log In"}
        {mode === "signup" && "Sign Up"}
        {mode === "reset" && "Reset Password"}
      </h1>

{/* FORM */}
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
              placeholder="Password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
            />
          </Form.Group>

{/* Confirm password in signup + reset mode */}
          {(mode === "signup" || mode === "reset") && (
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                value={cpwd}
                onChange={(e) => setCpwd(e.target.value)}
                required
              />
            </Form.Group>
          )}

{/* BUTTON */}
          <Button
            variant="dark"
            style={{ width: "300px", marginBottom: "5%" }}
            type="submit"
          >
            {mode === "login" && "Log In"}
            {mode === "signup" && "Sign Up"}
            {mode === "reset" && "Reset Password"}
          </Button>

{/* LINKS */}
          <span>
{/* Reset Password */}
            {mode === "login" && (
              <p
                style={{ float: "left", cursor: "pointer", color: "black", textDecoration: "underline" }}
                onClick={() => setMode("reset")}
              >
                Forgot password?
              </p>
            )}

{/* Toggle login <-> signup */}
            {(mode === "login" || mode === "signup") && (
              <p
                style={{
                  float: "right",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() =>
                  setMode(mode === "signup" ? "login" : "signup")
                }
              >
                {mode === "signup" ? "Already have an account?" : "Create Account"}
              </p>
            )}

{/* Back to login in reset mode */}
            {mode === "reset" && (
              <p
                style={{
                  float: "right",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => setMode("login")}
              >
                Back to Login
              </p>
            )}
          </span>

        </Form>
      </div>
    </>
  );
};

export default Login;