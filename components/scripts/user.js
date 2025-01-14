import { User } from "../../models/User.js";

const checkUserName = async (name) => {
  try {
    const user = await User.findOne({ username: name });
    return user === null ? true : false;
  } catch {}

  return false;
};

const User = { isUsernameAvailable: checkUserName };

export default User;
