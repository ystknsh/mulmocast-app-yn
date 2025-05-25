const hello = () => {
  console.log("Hello");
};

const Home = () => {
  return (
    <>
      <h2>Hello from React!</h2>
      <div className="bg-black text-white text-center">tailwind</div>
      <button onClick={hello}>hello</button>
    </>
  );
};

export default Home;
