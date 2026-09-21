import { NavLink, Link, useLocation } from "react-router-dom";

function Navbar() {
  const { search } = useLocation();
  const baseClasses =
    "rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400";
  const activeClasses = "bg-red-600 text-white";
  const inactiveClasses = "text-gray-400 hover:bg-gray-800 hover:text-white";

  return (
    <nav aria-label="Main navigation" className="flex flex-wrap gap-2 rounded-2xl border border-gray-800 bg-gray-900/70 p-2">
      <NavLink
        to={`/dashboard${search}`}
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to={`/drivers${search}`}
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        Drivers
      </NavLink>

      <NavLink
        to={`/teams${search}`}
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        Teams
      </NavLink>

      <NavLink
        to={`/races${search}`}
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        Races
      </NavLink>
      <Link to={`/${search}`} className={`${baseClasses} ${inactiveClasses} sm:ml-auto`}>Choose season</Link>
    </nav>
  );
}

export default Navbar;
