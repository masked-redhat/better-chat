import { Router } from "express";
import { Cookies } from "../components/scripts/encookieJS.js";
import bodyParser from "body-parser";
import { User } from "../models/User.js";
import { Channel } from "../models/Channel.js";
import { Chats } from "../models/Chats.js";
import { FFrends } from "../components/scripts/enfriendsJS.js";

const router = Router();

router.use(bodyParser.json())

router.get('/', async (req, res) => {
    try {
        let cookies = req.cookies;
        let match = await Cookies.checkCookie(cookies.usrID, cookies.__enc);
        if (match) {
            res.render('home');
        }
        else {
            res.status(200).redirect("/#signup");
        }
    } catch {
        res.status(200).redirect("/#signup");
    }
})

router.get('/name', async (req, res) => {
    let name = await Cookies.getUser(req.cookies);
    res.send(name.username);
})

router.get('/friends', async (req, res) => {
    let data = await FFrends.getUserFriendsAndChannels(req.cookies);
    res.send(JSON.stringify(data));
});

router.get('/notifications', async (req, res) => {
    let usr = await Cookies.getUser(req.cookies);
    res.send(JSON.stringify(usr.notifications));
});

router.post('/search', async (req, res) => {
    let cUser = await Cookies.getUser(req.cookies);
    let fdata = await FFrends.getFriendsSearch(cUser, req.body.text);
    let cdata = await FFrends.getChannelsSearch(req.body.text);

    let data = [...fdata, ...cdata];

    res.send(JSON.stringify(data));
});

router.put('/join', async (req, res) => {
    let body = req.body.user, type = req.body.type;
    let cUser = await Cookies.getUser(req.cookies);
    if (type == 'f') {
        let user = await User.findOne({ username: body });

        user.channels.push(`@${cUser.username}`)
        await user.save();
        cUser.channels.push(`@${user.username}`)
        await cUser.save();
        await Channel.create({ name: cUser.username + ' ' + user.username, dateCreated: new Date().toUTCString(), isPerson: true, members: [cUser.username, user.username] })
        await Chats.create({ name: cUser.username + ' ' + user.username })
    } else {
        let user = await Channel.findOne({ name: body });

        cUser.channels.push(`#${cUser.name}`);
        cUser.save();
        user.members.push(cUser.username);
        user.save();
    }

    res.send('{"status":"success"}');
})

router.post('/getchat', async (req, res) => {
    let user = await Cookies.getUser(req.cookies);
    let toConnet = req.body.name;
    let typeConnection = req.body.type;
    let chatName;
    if (typeConnection == 'c') {
        chatName = await Chats.findOne({ name: toConnet });
    }
    else {
        chatName = await Chats.findOne({ name: user.username + ' ' + toConnet });
        if (!chatName) {
            chatName = await Chats.findOne({ name: toConnet + ' ' + user.username });
        }
    }
    let data = chatName.chats;
    res.send(JSON.stringify(data));
})

router.put('/createchannel', async (req, res) => {
    res.send("{}")
})

export const HomeRouter = router;