export default function Sidebar() {
  return (
    <div className="w-60 bg-black text-white p-5 min-h-screen">
      <h2 className="text-xl font-bold mb-6">💰 Finance</h2>

      <ul className="space-y-4">
        <li className="hover:text-green-400 cursor-pointer">Dashboard</li>
        <li className="hover:text-green-400 cursor-pointer">Profile</li>
      </ul>
    </div>
  );
}