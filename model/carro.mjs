import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const schema = Schema({
  items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  subtotal: { type: Number, required: true, default: 0 },
  iva: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
});

export const Carro = mongoose.model('Carro', schema);
