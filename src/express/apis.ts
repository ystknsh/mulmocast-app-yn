import express from "express";

export const apiRouter = express.Router();

const tasks: Record<string, Status> = {};

const hello = async (req: express.Request, res: express.Response) => {
  const { processId } = req.params;
  console.log(processId);
  res.json({
    message: "hello",
  });
  return;
};

type ProgressCallback = (count: number) => void;

type Status = {
  counter: number;
  isRunning: boolean;
  taskPromise: Promise<void> | null;
  task: () => Promise<void> | null;
  addProgressListener: (cb: ProgressCallback) => () => void;
};
const dummy = () => {
  const listeners = new Set<ProgressCallback>();

  const ret: Status = {
    counter: 0,
    isRunning: false,
    taskPromise: null,
    task: null,
    addProgressListener: (cb: ProgressCallback) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
  };
  const task = async () => {
    if (ret.taskPromise) {
      return ret.taskPromise;
    }
    ret.isRunning = true;
    ret.taskPromise = new Promise<void>((resolve) => {
      let count = 0;
      const interval = setInterval(() => {
        if (count >= 10) {
          clearInterval(interval);
          resolve();
          return;
        }
        listeners.forEach((cb) => cb(count));
        count++;
      }, 1000);
    }).finally(() => {
      console.log("finally");
      ret.isRunning = false;
      ret.taskPromise = null;
    });
    return ret.taskPromise;
  };
  ret.task = task;
  return ret;
};

const run = async (req: express.Request, res: express.Response) => {
  const { processId } = req.params;
  console.log(processId);
  if (!processId) {
    res.status(404).send({ message: "Agent not found" });
    return;
  }
  if (tasks[processId]) {
    res.status(200).send({});
    return;
  }

  // run
  tasks[processId] = dummy();
  tasks[processId].task();
  res.json({
    message: "hello",
  });
  return;
};

const streamFunc = async (req: express.Request, res: express.Response) => {
  console.log("stream");
  const { processId } = req.params;
  if (!processId || !tasks[processId]) {
    res.status(404).send({ message: "Agent not found" });
    return;
  }
  // run
  const task = tasks[processId];

  if (!task.isRunning) {
    res.json({
      message: "not un",
    });
    return;
  }
  const __unregister = task.addProgressListener((count: number) => {
    console.log(`data: ${count}\n\n`);
  });

  await task.taskPromise;
  res.json({
    message: "finished",
  });
  return;
};

apiRouter.post("/mulmo/create", hello);

apiRouter.post("/mulmo/:processId/run", run);
// { processId }

apiRouter.get("/mulmo/:processId/status", hello);
// { status }

apiRouter.get("/mulmo/:processId/stream", streamFunc);
// apiRouter.get("/mulmo/:processId/stream", hello);

apiRouter.delete("/mulmo/:processId", hello);
