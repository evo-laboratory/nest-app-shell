import mongoose from 'mongoose';

export default function StringToObjectId(input: string) {
  return new mongoose.Types.ObjectId(input);
}
