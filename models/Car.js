const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    name: { type: String, required: true },
    model: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String }, // Store image filename
});

module.exports = mongoose.model('Car', carSchema);
