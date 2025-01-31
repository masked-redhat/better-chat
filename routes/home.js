import { Router } from "express";
import bodyParser from "body-parser";
import { User } from "../models/User.js";
import { Channel } from "../models/Channel.js";
import { Chats } from "../models/Chats.js";
import { FriendsAndChannels as fc } from "../components/scripts/friends.js";
import { Channels } from "../components/scripts/enchannelJS.js";

const router = Router();

router.use(bodyParser.json());

router.get("/", async (req, res) => {
  res.render("home");
});

router.get("/name", async (req, res) => {
  res.send(req.user.username);
});

router.get("/connections", async (req, res) => {
  let data = await fc.getUserFriendsAndChannels(req.user.channels);
  res.send(JSON.stringify(data));
});

// On Hold: still not decided
// router.get("/notifications", async (req, res) => {
//   let usr = await Auth.getUser(req.cookies);
//   res.send(JSON.stringify(usr.notifications));
// });

router.post("/search", async (req, res) => {
  let fdata = await fc.getFriendsSearch(req.user, req.body.text);
  let cdata = await fc.getChannelsSearch(req.body.text);

  let data = [...fdata, ...cdata];

  res.send(JSON.stringify(data));
});

router.put("/join", async (req, res) => {
  let body = req.body.user,
    type = req.body.type;

  let cUser = req.user.model;
  if (type == "f") {
    let user = await User.findOne({ username: body });

    user.channels.push(`@${cUser.username}`);
    await user.save();
    cUser.channels.push(`@${user.username}`);
    await cUser.save();
    await Channel.create({
      name: cUser.username + " " + user.username,
      dateCreated: new Date().toUTCString(),
      isPerson: true,
      members: [cUser.username, user.username],
    });
    await Chats.create({ name: cUser.username + " " + user.username });
  } else {
    let channel = await Channel.findOne({ name: body });

    cUser.channels.push(`#${channel.name}`);
    await cUser.save();
    channel.members.push(cUser.username);
    await channel.save();
  }

  res.send('{"status":"success"}');
});

router.post("/getchat", async (req, res) => {
  let user = req.user;
  let toConnect = req.body.name;
  let typeConnection = req.body.type;
  let chatName;
  if (typeConnection == "c") {
    chatName = await Chats.findOne({ name: `#${toConnect}`.replace(" ", "_") });
  } else {
    chatName = await Chats.findOne({ name: user.username + " " + toConnect });
    if (!chatName) {
      chatName = await Chats.findOne({ name: toConnect + " " + user.username });
    }
  }
  let data = chatName.chats;
  res.send(JSON.stringify(data));
});

router.get("/create", async (req, res) => {
  let channel = await Channels.isChannel(req.query.channelName);
  if (!channel) {
    let user = req.user.model;
    channel = await Channels.createChannel(req.query.channelName, [user]);
    channel["status"] = "OK";
    res.send(JSON.stringify(channel));
  } else {
    res.send('{"status":"DENIED"}');
  }
});

export const HomeRouter = router;
