import { Request, Response } from 'express';
import { OrderModel } from '../entities/order';

export const listOrders = async (req: Request, res: Response) => {
  const count = await OrderModel.countDocuments();
  res.header('Content-Range', count.toString());
  const orders = await OrderModel.find();
  res.json({
    data: orders,
  });
};

export const createOrders = async (req: Request, res: Response) => {
  const { _id: id } = await OrderModel.create({
    ...req.body,
  });
  res.json({
    id,
  });
};

export const getOrder = async (req: Request, res: Response) => {
  console.log(req.params);
  const order = await OrderModel.findById(req.params.id);

  res.json(order);
};

export const updateOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = await OrderModel.findByIdAndUpdate(
    id,
    {
      $set: {
        status,
      },
    },
    {
      new: true,
    },
  );

  console.log('Broadcast to WS', order.status);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.io.emit('message', order);
  res.json(order);
};
