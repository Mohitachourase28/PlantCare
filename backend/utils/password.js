import { genSalt, hash as _hash, compare } from 'bcrypt';

const hashPassword = async (password) => {
  const salt = await genSalt(10);
  return _hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return compare(password, hash);
};

export default {
  hashPassword,
  comparePassword
};