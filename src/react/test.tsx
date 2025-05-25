import React from "react";

const stream = async () => {
  console.log("stream");
  const url = "http://localhost:8085/api/mulmo/123/stream?" + Date.now();
  const __data = {};
  const response = await fetch(url, {
    // method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // body: JSON.stringify(__data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  console.log(await response.json());
};

const run = async () => {
  const url = "http://localhost:8085/api/mulmo/123/run";
  const data = {};
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  console.log(await response.json());
};

const Home: React.FC = () => {
  return (
    <>
      <h2>Text</h2>
      <button onClick={run}>run</button>
      <button onClick={stream}>stream</button>
    </>
  );
};

export default Home;
