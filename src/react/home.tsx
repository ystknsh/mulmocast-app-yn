import { Button } from "@/components/ui/button";
const hello = () => {
  console.log("Hello");
};

const Home = () => {
  return (
    <>
      <h2>Hello from React!</h2>
      <div className="bg-black text-white text-center">tailwind</div>
      <Button variant="outline" onClick={hello}>
        Button
      </Button>
    </>
  );
};

export default Home;
