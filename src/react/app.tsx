import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Link } from "react-router";

import Home from "./home";
import Test from "./test";

const root = createRoot(document.body);
root.render(
  <>
    <HashRouter>
      <div>
        <Link to="/">Home</Link>
        <Link to="/test">Test</Link>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </HashRouter>
  </>,
);
