import { Router } from "express";
import cookieParser from 'cookie-parser';
import bodyParser from "body-parser";
import { Password } from '../components/scripts/enpassJS.js';
import { Cookies } from "../components/scripts/encookieJS.js";
import { USR } from '../components/scripts/enuserJS.js';

const router = Router();

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/signup', async (req, res) => {
    let user = req.body.username;
    let pass = req.body.password;

    let available = await USR.checkUserName(user);

    if (!available) {
        res.status(400).send('{"status":"false"}');
        return;
    }

    let cookies = await Password.hashPasswordAndSave(user, pass);

    if (cookies) {
        res.status(200).cookie('usrID', cookies[0], Cookies.options).cookie('__enc', cookies[1], Cookies.options).send('{"status":"true"}');
    }
    else {
        res.status(403).send('{"status":"false"}')
    }
});

router.post('/login', async (req, res) => {
    let user = req.body.username;
    let pass = req.body.password;

    let match = await Password.checkPassword(user, pass);

    if (match) {
        let cookies = await Cookies.createCookie(user);
        res.status(200).cookie('usrID', cookies[0], Cookies.options).cookie('__enc', cookies[1], Cookies.options).send('{"status":"true"}');
    }
    else {
        res.status(403).send('{"status":"false"}')
    }
});

router.get('/logout', (req, res) => {
    try {
        res.clearCookie('usrID');
        res.clearCookie('__enc');
        res.send("logged out");
    } catch {
        res.status(403).send('{"status":"false"}')
    }
})

export const AuthRouter = router;