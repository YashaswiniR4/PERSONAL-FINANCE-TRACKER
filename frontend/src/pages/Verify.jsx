import { useParams } from "react-router-dom";
import { useEffect } from "react";
import API from "../services/api";

function Verify() {

  const { token } = useParams();

  useEffect(() => {

    const verifyUser = async () => {
      try {
        await API.get(`/verify/${token}`);
        alert("Email verified ✅");
      } catch {
        alert("Invalid or expired link ❌");
      }
    };

    verifyUser();

  }, []);

  return <h1 style={{textAlign:"center"}}>Verifying...</h1>;
}

export default Verify;