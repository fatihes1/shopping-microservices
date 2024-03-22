import mongoose from 'mongoose';

const { Schema } = mongoose;

const CustomerSchema = new Schema({
    email: String,
    password: String,
    salt: String,
    phone: String,
    address:[
        { type: Schema.Types.ObjectId, ref: 'address', require: true }
    ],
    cart: [
        {
            product: {
                _id: { type: String, require: true},
                name: { type: String},
                banner: { type: String},
                price: { type: Number},
            },
            unit: { type: Number, require: true}
        }
    ],
    wishlist:[
        {
            _id: { type: String, require: true },
            name: { type: String },
            description: { type: String },
            banner: { type: String },
            available: { type: Boolean },
            price: { type: Number}
        }
    ],
    orders: [ 
        {
            _id: { type: String, require: true },
            amount: { type: String },
            date: { type: Date, default: Date.now() }
        }
    ]
},{
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
        }
    },
    timestamps: true
});

const Customer =  mongoose.model('customer', CustomerSchema);

export default Customer;