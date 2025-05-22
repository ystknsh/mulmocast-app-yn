import express from "express";
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const hello = async (req: express.Request, res: express.Response) => {
  console.log("post from vue");
  res.json({
    message: "hello",
  });
  res.end();
};


app.get("/test", hello);
app.post("/test", hello);

const port = 8085;

export const runExpresse = () => {
  app.listen(port, () => {
    console.log("Running Server at " + port);
  });
};
