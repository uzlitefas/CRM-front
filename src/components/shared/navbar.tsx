import { AdminNav } from "@/constants";
import { Link } from "react-router-dom";
import { ModeToggle } from "./mod-toggle";
import UserDropdown from "./user-dropdown";

function Navbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-blue-900 shadow-md">
      <h1  
        className={"text-2xl text-blue-400 dark:text-white font-bold cursor-pointer"}
      >
        Logo
      </h1>

      <nav className="flex gap-6">
        {AdminNav.map((item) => (
          <Link key={item.route} to={`/admin${item.route}`}>
            <h2 
              className="text-gray-700 dark:text-blue-100 font-medium hover:text-blue-500 dark:hover:text-white transition-colors duration-200"
            >
              {item.label}
            </h2>
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <UserDropdown/>
      </div>
    </header>
  );
}

export default Navbar;
