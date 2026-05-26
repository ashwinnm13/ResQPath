import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Preloader from "./components/Preloader";

function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showPreloader && <Preloader />}
      <Dashboard />
    </>
  );
}

export default App;