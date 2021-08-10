import { prop, getModelForClass } from '@typegoose/typegoose';
import { Video } from './videos';

export class PlayListVideos {
  @prop()
  public id: string;

  @prop()
  public playlistId: string;

  @prop()
  public previewPage: string;

  @prop()
  public nextPage: string;

  @prop()
  public countVideos: number;

  @prop({ type: () => [Video], default: () => [Video] })
  public videos: Video[];
}

export const PlayListVideosModel = getModelForClass(PlayListVideos, {
  schemaOptions: { timestamps: true },
});
