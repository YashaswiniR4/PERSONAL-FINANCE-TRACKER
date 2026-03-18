import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Register() {

  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState(""); 

  const navigate = useNavigate();

  // STEP 1 → SEND OTP (FAKE)
const sendOTP = async () => {
  try {
    const res = await API.post("/send-otp", { email });

    console.log("🔥 OTP FROM BACKEND:", res.data.otp);

    alert("OTP sent! Check console or email 📩");

    setStep(2);

  } catch (err) {
    console.error(err);
    alert("Failed to send OTP");
  }
};
  // STEP 2 → VERIFY OTP + REGISTER
 const verifyAndRegister = async () => {
  try {

    // ✅ VERIFY OTP FROM BACKEND
    await API.post("/verify-otp", {
      email,
      otp
    });

    // ✅ REGISTER USER
    await API.post("/register", {
      email,
      password
    });

    alert("Registration Successful ✅");
    navigate("/");

  } catch (err: any) {
    alert(err.response?.data?.detail || "Invalid OTP ❌");
  }
};

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-500 to-blue-500">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">

        <h2 className="text-2xl font-bold mb-5 text-center">Register</h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              placeholder="Full Name"
              className="w-full p-2 mb-3 border rounded"
              onChange={(e)=>setName(e.target.value)}
            />

            <input
              placeholder="Phone Number"
              className="w-full p-2 mb-3 border rounded"
              onChange={(e)=>setPhone(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-3 border rounded"
              onChange={(e)=>setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 mb-3 border rounded"
              onChange={(e)=>setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-2 mb-4 border rounded"
              onChange={(e)=>setConfirm(e.target.value)}
            />

            <button
              onClick={sendOTP}
              className="w-full bg-blue-600 text-white p-2 rounded"
            >
              Send OTP
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              placeholder="Enter OTP"
              className="w-full p-2 mb-4 border rounded"
              onChange={(e)=>setOtp(e.target.value)}
            />

            <button
              onClick={verifyAndRegister}
              className="w-full bg-green-600 text-white p-2 rounded"
            >
              Verify & Register
            </button>
          </>
        )}

        <p className="text-sm mt-3 text-center">
          Already have account?{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={()=>navigate("/")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

export default Register;