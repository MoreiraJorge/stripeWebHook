import Koa from "koa";
import cors from "koa2-cors";
import stripeWebHook from "./routes/stripeWebHook";

require("dotenv").config();

const PORT = process.env.SERVER_PORT || 4001;
const SERVER_HOST = process.env.LOCAL_HOST;

const server = async () => {

    const app = new Koa();

    app
    .use(cors())
    .use(stripeWebHook.routes())
    .use(stripeWebHook.allowedMethods());

    app.listen(PORT, () => {
        console.log(
          `🚀 Server running on http://${SERVER_HOST}:${PORT}/`);
      })
      .on("error", (err) => {
        console.log(err);
      });
} 

server();