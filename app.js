import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { Chats } from "./models/Chats.js";
import { User } from "./models/User.js";
import { Channels } from "./components/scripts/enchannelJS.js";
import APP from "./constants/env.js";
import { connectToMongo } from "./db/db.js";
import { Router as r } from "./routes/routes.js";

// application configuration
const app = express();
const server = createServer(app);
const io = new Server(server);
const port = APP.PORT;

// connect to database
await connectToMongo();

// set viewing engine to be 'ejs'
app.set("view engine", "ejs");

// middlewares and static files
app.use(express.static("public"));
app.use(cookieParser());

// application routes
app.use("/", r.RootRouter);
app.use("/auth", r.AuthRouter);
app.use("/home", r.HomeRouter);

io.on("connection", (socket) => {
  console.log("a user connected - ", socket.id);
  let USER;

  socket.on("chat", async (params) => {
    let msg = params[0];
    let chnl = params[1],
      chnlT = params[2];
    console.log(msg, chnl, chnlT);
    let chatCh;
    if (chnlT == "f") {
      chatCh = await Channels.getChannelChatfromFriends(USER.username, chnl);
      chatCh.chats.push({ user: USER.username, text: msg });
      chatCh.save();
      socket
        .to(chatCh.name)
        .emit("chatFrom", { user: USER.username, type: "f", text: msg });
    } else {
      chatCh = await Chats.findOne({ name: `#${chnl}`.replace(" ", "_") });
      chatCh.chats.push({ user: USER.username, text: msg });
      chatCh.save();
      socket.to(chatCh.name).emit("chatFrom", {
        user: USER.username,
        type: "c",
        text: msg,
        channel: chnl,
      });
    }
  });

  socket.on("namesetup", async (nme) => {
    let user = await User.findOne({ username: nme });
    USER = user;
    socket.join(`@@@@user@@@@${USER.username}`);
    for (const channel of USER.channels) {
      if (channel.startsWith("@")) {
        let chatCh = await Channels.getChannelChatfromFriends(
          USER.username,
          channel.slice(1)
        );
        socket.to(chatCh.name).emit("onlineFriends", [1, USER.username]);
        socket.join(chatCh.name);
      } else {
        let chatCh = await Channels.getChannelChatfromChannels(
          channel.slice(1)
        );
        socket.join(chatCh.name);
        socket.to(chatCh.name).emit("chatFrom", {
          usr: channel.slice(1),
          text: `${USER.username}, Joined...`,
          type: "c",
        });
      }
    }
  });

  socket.on("friendAdded", async (val) => {
    let chatCh = await Channels.getChannelChatfromFriends(USER.username, val);
    USER = await User.findOne({ username: USER.username });
    socket.join(chatCh.name);
    socket.emit("onlineFriends", [1, val]);
  });

  socket.on("addFriend", async (usr) => {
    let chatCh = await Channels.getChannelChatfromFriends(USER.username, usr);
    USER = await User.findOne({ username: USER.username });
    socket.join(chatCh.name);
    socket.to(`@@@@user@@@@${usr}`).emit("friendAdded", USER.username);
  });

  socket.on("OnlineFriend", async (val) => {
    let ChatCh = await Channels.getChannelChatfromFriends(
      USER.username,
      val[1]
    );
    socket.to(ChatCh.name).emit("OnlineFriend", 1);
  });

  socket.on("disconnect", async () => {
    try {
      console.log(USER.username, " disconnected");
      for (const channel of USER.channels) {
        if (channel.startsWith("@")) {
          let chatCh = await Channels.getChannelChatfromFriends(
            USER.username,
            channel.slice(1)
          );
          socket.to(chatCh.name).emit("onlineFriends", [-1, USER.username]);
        }
      }
    } catch {
      console.log("user disconnected - ", socket.id);
    }
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
