import { images } from "mulmocast/lib/actions/index";
import { initializeContext } from "mulmocast/lib/cli/helpers";

export const mulmoTest = async (option) => {
  const argv = {
    b: __dirname + "/../../",
    o: __dirname + "/../../output",
    file: option.file,
  };
  console.log(argv);
  const context = await initializeContext(argv);
  console.log(context);
  await images(context);

  console.log(option);
};
