import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl p-6">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">
            Formula 1 Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Explore drivers, teams, races, and season statistics
          </p>
        </header>

        <Navbar />

        {children}
      </div>
    </div>
  );
}

export default Layout;