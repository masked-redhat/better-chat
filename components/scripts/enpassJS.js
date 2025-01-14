import bcrypt from "bcrypt";
import { User } from "../../models/User.js";
import Auth from "../../middlewares/auth.js";

const hashPasswordAndSave = async (name, pass) => {
  let passHSH = bcrypt.hashSync(pass, 13);

  const usr = await User.create({
    username: name,
    password: passHSH,
  });

  if (usr) {
    return await Auth.setupAuth(name);
  } else {
    return false;
  }
};

const checkPassword = async (name, pass) => {
  const usr = await User.findOne({ username: name });
  if (usr) {
    let checked = bcrypt.compareSync(pass, usr.password);
    return checked;
  }
  return false;
};

export const Password = { hashPasswordAndSave, checkPassword };
