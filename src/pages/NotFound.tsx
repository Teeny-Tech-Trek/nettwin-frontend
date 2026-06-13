import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center"
      style={{ background: "#05050f" }}
    >
      <h1
        className="font-syne-bold text-7xl sm:text-8xl font-extrabold leading-none tracking-tight"
        style={{
          background: "linear-gradient(90deg,#22d3ee 0%,#3b82f6 50%,#a855f7 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        404
      </h1>
      <p className="mt-4 text-lg sm:text-xl font-medium text-white/90">
        Oops! Page not found
      </p>
      <p className="mt-2 max-w-md text-sm text-white/50">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <a
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
        style={{
          background: "linear-gradient(90deg,#22d3ee 0%,#3b82f6 50%,#a855f7 100%)",
          boxShadow: "0 0 24px rgba(59,130,246,0.35)",
        }}
      >
        Return to Home
      </a>
    </div>
  );
};

export default NotFound;
