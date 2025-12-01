import mongoose from 'mongoose';
import { ItemSchema } from './item.mjs';

const Schema = mongoose.Schema;

const schema = Schema({
  items: [ItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  iva: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
}, { _id: false });

export const CarroSchema = schema;
