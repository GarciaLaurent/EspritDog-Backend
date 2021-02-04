import prod from './prod';
import dev from './dev';

export const keys = process.env.NODE_ENV === 'production' ? prod : dev;
