import { OS, UserType } from '../util/constants';

export interface Review {
  id: string;
  url: string;
  text: string;
  title: string;
  score: number;
  userName: string;
  userType: UserType;
  userImage: string;
  os: OS;
  date: string;
}
