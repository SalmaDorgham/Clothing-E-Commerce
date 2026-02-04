import { useNavigate, useSearchParams } from "react-router-dom";
import { backendURL } from "../App";
import { useEffect } from "react";
import { toast } from "react-toastify";

const Verify = ({ token }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const verifyPayment = async () => {
    try {
      if (!token) return;

      const res = await fetch(`${backendURL}/order/verifyStripe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ success, orderId }),
      });

      const data = await res.json();

      if (data.success) {
        window.dispatchEvent(new Event("cart:updated"));
        navigate("/orders");
      } else {
        navigate("/cart");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      navigate("/cart");
    }
  };

  useEffect(() => {
    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return <div></div>;
};

export default Verify;