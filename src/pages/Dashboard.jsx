import { Link, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";
import { useEffect } from "react";

const Dashboard = () => {

  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      title: "End-to-End Encryption",
      desc: "AES-256 encryption ensures your data stays private.",
      icon: "🔒",
    },
    {
      title: "Zero Latency",
      desc: "Direct P2P connection for instant transfer.",
      icon: "⚡",
    },
    {
      title: "Cross-Device Sync",
      desc: "Access files seamlessly across all devices.",
      icon: "🔄",
    },
    {
      title: "Collaboration Rooms",
      desc: "Share files with multiple users in real-time.",
      icon: "👥",
    },
  ];

  useEffect(() => {
    if(!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="w-full bg-linear-to-br from-blue-50 to-green-50 min-h-screen">

      {/* ================= SECTION 1 ================= */}
      <div className="grid md:grid-cols-2  px-10 py-14 gap-6 md:gap-10 items-center">
        
        {/* Left */}
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Fast, Secure, and <br />
            <span className="text-blue-700">Architectural Grade</span> <br />
            File Sharing
          </h1>

          <p className="text-gray-500 mt-6 max-w-md">
            The Fuild Architecture for your data.
            Transfer large files instantly with end-to-end encryption.
            Experience seamless and weightless data sharing.
          </p>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate("/transfer")}
              className="bg-linear-to-r from-blue-600 to-sky-500 text-white font-semibold px-5 py-2.5  hover:bg-blue-700 rounded-2xl"
            >
              🚀 Send Files
            </button>

            <button
              onClick={() => navigate("/receive")}
              className="bg-white font-semibold px-5 py-2.5 rounded-2xl"
            >
              🔑 Enter Code
            </button>
          </div>
        </div>

        {/* Right (Image Placeholder) */}
        <div className="w-full mt-16 md:mt-0 p-10 md:p-0 h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400">
          <img src="https://assets-160c6.kxcdn.com/wp-content/uploads/2020/08/2020-08-20-en-de.jpg" alt="" />
        </div>
      </div>

      {/* ================= SECTION 2 ================= */}
      <div className="px-10 py-14 bg-linear-to-r from-green-50 to-blue-50">
        <h2 className="text-2xl font-semibold mb-2">
          Core Infrastructure Features
        </h2>

        <p className="text-gray-500 mb-6 max-w-lg">
          Built for speed, reliability, and secure file transfer across devices.
        </p>

        <div className="grid md:grid-cols-4 gap-6">
          
          {cards?.map((card, i) => (
            <div
              key={i}
              className="p-5 gap-1 flex flex-col justify-center bg-white hover:shadow-md transition rounded-xl"
            >
              <p className="text-2xl mb-3 w-fit rounded-[20px] p-2 bg-blue-200/30">
                {card.icon}
              </p>
              <h3 className="font-semibold mb-1">{card.title}</h3>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= SECTION 3 ================= */}

      <div className="p-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Syncs</h3>

          <Link to="/history" className="text-blue-600 text-lg ">
            View all
          </Link>
        </div>

        <div className="bg-gray-100 rounded-xl p-4  space-y-3">

          {/* Header */}
          <div className="grid grid-cols-4 pb-3 border-b border-dashed text-gray-600 font-semibold">
            <p>File Name</p>
            <p className="text-center">Size</p>
            <p className="text-center">Date</p>
            <p className="text-center">Completion</p>
          </div>

          {/* Item 1 */}
          <div className="grid grid-cols-4 items-center bg-white px-4 py-3 rounded-lg ">
            <p className="truncate font-medium">Vacation_Photos.zip</p>

            <p className="text-center text-sm text-gray-500">50 MB</p>

            <p className="text-center text-xs text-gray-400">
              {new Date().toLocaleString()}
            </p>

            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-full"></div>
              </div>
              <span className="text-xs w-10 text-right">100%</span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="grid grid-cols-4 items-center bg-white px-4 py-3 rounded-lg ">
            <p className="truncate font-medium">Project_Specs_V4.pdf</p>

            <p className="text-center text-sm text-gray-500">1 MB</p>

            <p className="text-center text-xs text-gray-400">
              {new Date().toLocaleString()}
            </p>

            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full w-[84%]"></div>
              </div>
              <span className="text-xs w-10 text-right">84%</span>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;