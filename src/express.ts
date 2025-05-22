import express from "express";

const app = express();

app.use(express.json());

const hello = async (req: express.Request, res: express.Response) => {
  res.json({
    message: "hello",
  });
  res.end();
};


app.get("/test", hello);

const port = 8085;

export const runExpresse = () => {
  app.listen(port, () => {
    console.log("Running Server at " + port);
  });
};
