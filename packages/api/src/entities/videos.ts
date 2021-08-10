import { prop, getModelForClass } from '@typegoose/typegoose';

export class Video {
  @prop()
  public id: string;

  @prop()
  public videoId: string;

  @prop()
  public thumbnails: string;

  @prop()
  public title: string;
}

export const VideoModel = getModelForClass(Video, {
  schemaOptions: { timestamps: true },
});
