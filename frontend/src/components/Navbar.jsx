import { NavLink } from "react-router-dom";

function Navbar() {
  const baseClasses =
    "rounded-xl px-4 py-2 text-sm font-medium transition";
  const activeClasses = "bg-red-600 text-white";
  const inactiveClasses = "bg-white text-gray-700 hover:bg-gray-100";

  return (
    <nav className="mb-8 flex flex-wrap gap-3">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/drivers"
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        Drivers
      </NavLink>

      <NavLink
        to="/teams"
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        Teams
      </NavLink>

      <NavLink
        to="/races"
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        Races
      </NavLink>
    </nav>
  );
}

export default Navbar;