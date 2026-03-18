import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

import { useEffect, useState } from "react";
import API from "../services/api";
import { Pie, Bar } from "react-chartjs-2";

export default function Dashboard({ dark, setDark }: any) {

  const [data, setData] = useState<any[]>([]);
  const [active, setActive] = useState("dashboard");
  const [filter, setFilter] = useState("all");

  const [user, setUser] = useState({
    name: "Yashaswini",
    email: localStorage.getItem("email") || "user@gmail.com"
  });

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("income");
  const [editId, setEditId] = useState<string | null>(null);

  // ✅ LOAD DATA
  const loadData = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) return;

      const res = await API.get(`/all/${user_id}`);
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ ADD / UPDATE
  const handleSubmit = async () => {
    if (!amount || !category) return alert("Fill all fields");

    const payload = {
      amount: Number(amount),
      category,
      type,
      user_id: localStorage.getItem("user_id") // 🔥 IMPORTANT
    };

    if (editId) {
      await API.put(`/update/${editId}`, payload);
      setEditId(null);
    } else {
      await API.post("/add", payload);
    }

    setAmount("");
    setCategory("");
    setType("income");

    loadData();
  };

  // DELETE
  const handleDelete = async (id: string) => {
    await API.delete(`/delete/${id}`);
    loadData();
  };

  // EDIT
  const handleEdit = (t: any) => {
    setAmount(String(t.amount));
    setCategory(t.category);
    setType(t.type);
    setEditId(t._id);
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // CALCULATIONS
  let income = 0, expense = 0;
  data.forEach((t: any) => {
    t.type === "income" ? income += t.amount : expense += t.amount;
  });

  const pieData = {
    labels: ["Income", "Expense"],
    datasets: [{
      data: [income || 1, expense || 1],
      backgroundColor: ["#22c55e", "#ef4444"]
    }]
  };

  const barData = {
    labels: ["Income", "Expense"],
    datasets: [{
      label: "Amount",
      data: [income, expense],
      backgroundColor: ["#22c55e", "#ef4444"]
    }]
  };

  return (
    <div className={`${dark ? "bg-[#0f172a] text-white" : "bg-gray-200 text-black"} min-h-screen flex`}>

      {/* SIDEBAR */}
      <div className="w-60 bg-[#020617] text-white p-5 flex flex-col justify-between">

        <div>
          <h2 className="text-xl font-bold mb-6">💰 Finance</h2>

          {["dashboard","wallet","transactions","analytics"].map(item => (
            <p
              key={item}
              onClick={()=>setActive(item)}
              className={`mb-3 p-2 rounded cursor-pointer capitalize ${
                active === item ? "bg-blue-500" : "text-gray-400"
              }`}
            >
              {item}
            </p>
          ))}
        </div>

        {/* PROFILE */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center gap-3 mb-3 p-3 bg-[#0f172a] rounded-lg">
            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">👤</div>
            <div>
              <p>{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>

          <button onClick={()=>setActive("settings")} className="w-full mb-2 text-gray-400">⚙️ Settings</button>
          <button onClick={handleLogout} className="w-full text-red-400">🚪 Logout</button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        {/* TOP */}
        <div className="flex justify-between mb-6">
          <input placeholder="Search..." className="p-3 rounded w-1/2 bg-white text-black border" />
          <button onClick={()=>setDark(!dark)} className="bg-purple-500 px-4 py-2 rounded text-white">Toggle Theme</button>
        </div>

        {/* FORM */}
        <div className="bg-white p-6 rounded mb-6 flex gap-4">
          <input type="number" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} className="p-2 border rounded"/>
          <input placeholder="Category" value={category} onChange={(e)=>setCategory(e.target.value)} className="p-2 border rounded"/>
          <select value={type} onChange={(e)=>setType(e.target.value)} className="p-2 border rounded">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <button onClick={handleSubmit} className="bg-blue-600 px-4 rounded text-white">
            {editId ? "Update" : "Add"}
          </button>
        </div>

        {/* DASHBOARD */}
        {active === "dashboard" && (
          <>
            {/* CARDS */}
            <div className="grid grid-cols-3 gap-6 mb-6 text-center">
              <div className="bg-blue-500 p-6 rounded text-white">Balance ₹{income - expense}</div>
              <div className="bg-green-500 p-6 rounded text-white">Income ₹{income}</div>
              <div className="bg-red-500 p-6 rounded text-white">Expense ₹{expense}</div>
            </div>

            {/* FILTER */}
            <div className="mb-4 flex gap-2">
              <button onClick={()=>setFilter("all")} className="px-3 py-1 bg-gray-300 rounded">All</button>
              <button onClick={()=>setFilter("income")} className="px-3 py-1 bg-green-400 rounded">Income</button>
              <button onClick={()=>setFilter("expense")} className="px-3 py-1 bg-red-400 rounded">Expense</button>
            </div>

            {/* TRANSACTIONS */}
            <div className="bg-white p-6 rounded mb-6 text-black">
              {data.length === 0 && <p>No transactions yet</p>}

              {data
                .filter((t:any)=> filter==="all" || t.type===filter)
                .map((t:any)=>(
                  <div key={t._id} className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2">
                    <div>
                      <p className="font-semibold">{t.category}</p>
                      <p className="text-sm">{t.type}</p>
                    </div>

                    <p className="font-bold">₹{t.amount}</p>

                    <div className="flex gap-2">
                      <button onClick={()=>handleEdit(t)} className="bg-yellow-400 px-2 rounded">Edit</button>
                      <button onClick={()=>handleDelete(t._id)} className="bg-red-500 px-2 text-white rounded">Delete</button>
                    </div>
                  </div>
              ))}
            </div>

            {/* CHARTS */}
            <div className="bg-white p-6 rounded flex gap-6 justify-center">
              <div className="w-40"><Pie data={pieData} /></div>
              <div className="w-60"><Bar data={barData} /></div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}