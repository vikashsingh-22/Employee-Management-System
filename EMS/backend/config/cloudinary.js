const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: 'dik64jv3h',
    api_key: '791342259165649',
    api_secret: 'eBv0yZwHVTaLX4_67ILkbGOp5Mo'
});

module.exports = cloudinary;
