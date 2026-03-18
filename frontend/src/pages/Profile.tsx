import { useState } from "react";

export default function Profile() {

  const [name,setName]=useState("");
  const [email,setEmail]=useState("");

  const save=()=>{
    alert("Profile Updated");
  }

  return (
    <div className="p-6 text-white bg-[#0f172a] min-h-screen">
      <h1 className="text-xl mb-4">Profile</h1>

      <input placeholder="Name" className="block mb-3 p-2 bg-gray-800"
        onChange={e=>setName(e.target.value)} />

      <input placeholder="Email" className="block mb-3 p-2 bg-gray-800"
        onChange={e=>setEmail(e.target.value)} />

      <button onClick={save} className="bg-blue-500 px-4 py-2 rounded">
        Save
      </button>
    </div>
  );
}