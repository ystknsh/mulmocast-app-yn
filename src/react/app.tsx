import { createRoot } from "react-dom/client";

const hello = () => {
  console.log("Hello");
};
const root = createRoot(document.body);
root.render(
  <>
    <h2>Hello from React!</h2>
    <div className="bg-black text-white text-center">tailwind</div>
    <button onClick={hello}>hello</button>
  </>,
);
