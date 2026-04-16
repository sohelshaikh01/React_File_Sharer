import { Link, Outlet, useLocation } from "react-router-dom";
import useAuth from "./context/useAuth";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Layout = () => {

  const { pathname } = useLocation();
  const { logout } = useAuth();

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col flex-wrap">
      <div className="">
        
        <nav className="h-17 flex flex-col justify-center bg-white">
          <Navbar />
        </nav>

        <main className="flex-1">
          <Outlet />
        </main>


        <footer>
          <Footer />
        </footer>

      </div>
    </div>
  );
};

export default Layout;