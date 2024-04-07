import mongoose from 'mongoose';

const { Schema } = mongoose;


const WishlistSchema = new Schema({
    customerId: { type: String },
    products: [
        {
            _id: { type: String, require: true},
        }
    ]
});

const Wishlist =  mongoose.model('wishlist', WishlistSchema);

export default Wishlist;