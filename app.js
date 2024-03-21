import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { AuthRouter } from './routes/authentication.js';
import { RootRouter } from './routes/root.js';
import { HomeRouter } from './routes/home.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Chats } from './models/Chats.js';
import { User } from './models/User.js';
import { Channels } from './components/scripts/enchannelJS.js';
import dotenv from 'dotenv'
dotenv.config()

const db = await mongoose.connect(process.env.MONGO_URL);

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(cookieParser());


app.use('/', RootRouter)

app.use('/auth', AuthRouter)

app.use('/home', HomeRouter)

io.on('connection', (socket) => {

    console.log('a user connected - ', socket.id)
    let USER;

    socket.on('chat', async (params) => {
        let msg = params[0];
        let chnl = params[1], chnlT = params[2];
        let chatCh;
        if (chnlT == 'f') {
            chatCh = await Channels.getChannelChatfrom(USER.username, chnl);
            chatCh.chats.push({ user: USER.username, text: msg });
            chatCh.save();
        }
        else {
            chatCh = await Chats.findOne({ name: chnl }); chatCh.chats.push({ user: USER.username, text: msg });
            chatCh.save();
        }
        socket.to(chatCh.name).emit('chatFrom', { user: USER.username, type: 'f', text: msg })
    })

    socket.on('namesetup', async (nme) => {
        let user = await User.findOne({ username: nme });
        USER = user;
        socket.join(`@@@@user@@@@${USER.username}`)
        for (const channel of USER.channels) {
            if (channel.startsWith("@")) {
                let chatCh = await Channels.getChannelChatfrom(USER.username, channel.slice(1));
                socket.to(chatCh.name).emit('onlineFriends', [1, USER.username])
                socket.join(chatCh.name);
            }
        }
    })

    socket.on('friendAdded', async (val) => {
        let chatCh = await Channels.getChannelChatfrom(USER.username, val);
        USER = await User.findOne({ username: USER.username });
        socket.join(chatCh.name);
        socket.emit('onlineFriends', [1, val]);
    })

    socket.on('addFriend', async (usr) => {
        let chatCh = await Channels.getChannelChatfrom(USER.username, usr);
        USER = await User.findOne({ username: USER.username });
        socket.join(chatCh.name);
        socket.to(`@@@@user@@@@${usr}`).emit('friendAdded', USER.username);
    })

    socket.on('OnlineFriend', async (val) => {
        let ChatCh = await Channels.getChannelChatfrom(USER.username, val[1]);
        socket.to(ChatCh.name).emit('OnlineFriend', 1);
    })

    socket.on('disconnect', async () => {
        try {
            console.log(USER.username, " disconnected"); for (const channel of USER.channels) {
                if (channel.startsWith("@")) {
                    let chatCh = await Channels.getChannelChatfrom(USER.username, channel.slice(1));
                    socket.to(chatCh.name).emit('onlineFriends', [-1, USER.username]);
                }
            }
        }
        catch {
            console.log('user disconnected - ', socket.id);
        }

    })
})



server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})