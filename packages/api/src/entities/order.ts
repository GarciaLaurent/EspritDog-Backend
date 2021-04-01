import { prop, getModelForClass } from '@typegoose/typegoose';

export const STATUS_ORDERED = 'ORDERED';
export const STATUS_ACCEPTED = 'ACCEPTED';
export const STATUS_READY = 'READY';
export const STATUS_FINISHED = 'FINISHED';

class Item {
  @prop()
  public name: string;

  @prop()
  public quantity: number;
}
export class Order {
  @prop()
  public user: string;

  @prop()
  public pharmacy: string;

  @prop({
    default: STATUS_ORDERED,
  })
  public status: string;

  @prop({ type: () => [Item] })
  public items: Item[];

  @prop()
  public photo: string;
}

export const OrderModel = getModelForClass(Order, {
  schemaOptions: { timestamps: true },
});
