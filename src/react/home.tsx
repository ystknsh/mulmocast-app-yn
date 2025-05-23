import React from "react";

const hello = () => {
  console.log("Hello");
};

const Home: React.FC = () => {
  return (
    <>
      <h2>Hello from React!</h2>
      <div className="bg-black text-white text-center">tailwind</div>
      <button onClick={hello}>hello</button>
    </>
  );
};

export default Home;
