import { User } from "../../models/User.js";

const checkUserName = async (name) => {
    let usr = await User.findOne({ username: name });
    if (usr == null) {
        return true;
    }
    else {
        return false;
    }
}

export const USR = { checkUserName };