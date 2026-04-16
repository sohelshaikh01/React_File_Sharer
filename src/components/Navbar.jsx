import React from 'react';

import { NavLink, Link , useNavigate} from 'react-router-dom';
import useAuth from '../context/useAuth';
import { toast } from 'react-toastify';

const Navbar = () => {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navRoutes = [
        { name: "Dashboard", link: "/"},
        { name: "Transfer", link: "/transfer" },
        { name: "Receive", link: "/receive" },
        { name: "History", link: "/history" },
        { name: "Profile", link: "/profile" }
    ];

    const authRoutes = [
        { name: "Login", link: "/login"},
        { name: "Sign Up", link: "/register" }
    ];

    const handelLogout = async () => {
        await logout();
        toast.success("You are Logged Out");
        navigate('/login');
    }

  return (
    <div className='w-full flex flex-col items-center'>
        <div className='mx-auto w-full px-6 py-2 flex flex-row justify-between items-center'>
            <div>
                <Link to="/">
                    <h2 className='font-bold text-2xl text-sky-600'>SyncShare</h2>
                </Link>
            </div>

            <ul className='list-none px-2 space-x-3 flex flex-row items-center'>
                {user ? 
                (navRoutes.map((route) => (
                    <NavLink
                        key={route.name}
                        to={route.link}
                        className={({ isActive }) =>
                        `${isActive 
                            ? "text-black" 
                            : "bg-linear-to-r from-blue-600 to-sky-500 text-white"
                        } px-4 py-2 rounded-full font-semibold`
                        }
                    >
                        {route.name}
                    </NavLink>
                    ))) : (
                    authRoutes.map((route) => (
                        <NavLink
                        key={route.name}
                        to={route.link}
                        className={({ isActive }) =>
                            `${isActive 
                            ? "bg-linear-to-r from-blue-600 to-sky-500 text-white" 
                            : "text-black"
                            } px-4 py-2 rounded-full font-semibold`
                        }
                        >
                        {route.name}
                        </NavLink>
                    )))}
                    {user && 
                    <button className="bg-linear-to-r from-blue-600 to-sky-500 text-white px-4 py-2 rounded-full font-semibold"
                    onClick={handelLogout}>Logout</button>}
            </ul>

        </div>
    </div>
  )
}

export default Navbar;
