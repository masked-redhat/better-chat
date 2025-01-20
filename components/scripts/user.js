import { User as u } from "../../models/User.js";

const checkUserName = async (username) => {
  try {
    const user = await u.findOne({ username });
    return user === null ? true : false;
  } catch {}

  return false;
};

const User = { isUsernameAvailable: checkUserName };

export default User;
