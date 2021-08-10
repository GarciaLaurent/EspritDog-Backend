import { Request, Response } from 'express';
import { User, UserModel } from '../entities/user';

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  const count = await UserModel.countDocuments();
  res.header('Content-Range', count.toString());
  const orders = await UserModel.find();
  res.json({
    data: orders,
  });
};

//Call controller API
export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = await getUserByUsername(req.body.username);
  if (!user) {
    const currentUser = await UserModel.create({
      ...req.body,
    });
    res.json({
      id: currentUser.id,
      firstname: currentUser.firstName,
      lastname: currentUser.lastName,
      username: currentUser.username,
      offer: currentUser.offer,
      password: currentUser.password,
    });
  } else {
    res.json({ error: 'error' });
  }
};

//function  connected to DATABASE
export const getUserByUsername = async (username: string): Promise<User> => {
  const user = await UserModel.findOne({
    username,
  });
  return user;
};

export const getUserById = async (id: string): Promise<User> => {
  const user = await UserModel.findById(id);
  return user;
};

//Call controller API
export const logIn = async (req: Request, res: Response): Promise<void> => {
  const user = await UserModel.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (user) {
    res.json({ user: user });
  } else {
    res.json({ user: null, error: 'error' });
  }
};

export const changeUserPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.body.id;
  const newPassword = req.body.newpassword;
  const user = await getUserById(id);
  await UserModel.updateOne(
    { _id: id },
    {
      $set: {
        password: newPassword,
      },
    },
  );
  if (user) {
    res.json({ user: user });
  } else {
    res.json({ user: null, error: 'error' });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.body.userId;
  const user = await getUserById(id);
  await UserModel.deleteOne(id);
  res.json({ user: user });
};
