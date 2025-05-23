import React from "react";

const hello = () => {
  console.log("test");
};

const Home: React.FC = () => {
  return (
    <>
      <h2>Text</h2>
      <button onClick={hello}>test</button>
    </>
  );
};

export default Home;
