import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const schema = Schema({
  cantidad: { type: Number, required: true, default: 0 },
  libro: { type: Schema.Types.Mixed, required: true },
  total: { type: Number, required: true, default: 0 },
});

export const Item = mongoose.model('Item', schema); 