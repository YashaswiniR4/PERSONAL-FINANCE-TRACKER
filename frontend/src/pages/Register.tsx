import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Register() {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {

    if (!email || !password || !confirm) {
      return alert("Fill all fields ❌");
    }

    if (password !== confirm) {
      return alert("Passwords do not match ❌");
    }

    try {
      const res = await API.post("/register", {
        email,
        password
      });

      alert("👉 Click to verify:\n" + res.data.verify_link);

    } catch (err) {
      alert("Registration failed ❌");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-500 to-blue-500">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">

        <h2 className="text-2xl font-bold mb-5 text-center">Register</h2>

        <input placeholder="Full Name" className="w-full p-2 mb-3 border rounded" onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Phone Number" className="w-full p-2 mb-3 border rounded" onChange={(e)=>setPhone(e.target.value)} />
        <input type="email" placeholder="Email" className="w-full p-2 mb-3 border rounded" onChange={(e)=>setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full p-2 mb-3 border rounded" onChange={(e)=>setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" className="w-full p-2 mb-4 border rounded" onChange={(e)=>setConfirm(e.target.value)} />

        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Register
        </button>

        <p className="text-sm mt-3 text-center">
          Already have account?{" "}
          <span className="text-blue-500 cursor-pointer" onClick={()=>navigate("/")}>
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

export default Register;