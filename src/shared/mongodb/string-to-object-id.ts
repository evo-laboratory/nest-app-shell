import mongoose from 'mongoose';

export function StringToObjectId(input: string) {
  return new mongoose.Types.ObjectId(input);
}
