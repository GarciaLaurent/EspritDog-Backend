import { prop, getModelForClass } from '@typegoose/typegoose';

export const PKG_START = 'PKG_START';
export const PKG_PUPPY = 'PKG_PUPPY';
export const PKG_FAMILY = 'PKG_FAMILY';
export const PKG_FIRST_AID = 'PKG_FIRST_AID';
export const PKG_BITE = 'PKG_BITE';
export const PKG_PRO = 'PKG_PRO';

class Offer {
  @prop({
    default: PKG_START,
  })
  public type: string;
}

export class User {
  @prop()
  public firstName: string;

  @prop()
  public lastName: string;

  @prop()
  public username: string;

  @prop()
  public password: string;

  @prop()
  public birthDate: Date;

  @prop({ type: () => [Offer], default: () => [Offer] })
  public offer: Offer[];
}

export const UserModel = getModelForClass(User, {
  schemaOptions: { timestamps: true },
});
