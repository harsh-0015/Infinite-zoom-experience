import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Experience from "./pages/Experience";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/experience" element={<Experience />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
