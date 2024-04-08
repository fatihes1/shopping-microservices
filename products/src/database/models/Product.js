import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProductSchema = new Schema({
  name: String,
  desc: String,
  banner: String,
  type: String,
  unit: Number,
  price: Number,
  available: Boolean,
  suplier: String,
});

const Product = mongoose.model('Product', ProductSchema);

export default Product;
