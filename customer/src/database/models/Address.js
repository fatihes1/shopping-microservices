import mongoose from 'mongoose';

const { Schema } = mongoose;

const AddressSchema = new Schema({
    street: String,
    postalCode: String,
    city: String,
    country: String
});

const Address = mongoose.model('Address', AddressSchema);

export default Address;
