import bcrypt from "bcrypt";
import { User } from "../../models/User.js";

const hashPasswordAndSave = async (username, password) => {
  const hashedPassword = bcrypt.hashSync(password, 13);

  const user = await User.create({
    username,
    password: hashedPassword,
  });

  return user ? true : false;
};

const checkPassword = async (username, password) => {
  try {
    const user = await User.findOne({ username });
    if (user) {
      let checked = bcrypt.compareSync(password, user.password);
      return checked;
    }
  } catch {}
  return false;
};

const Password = { hashAndSave: hashPasswordAndSave, check: checkPassword };

export default Password;
