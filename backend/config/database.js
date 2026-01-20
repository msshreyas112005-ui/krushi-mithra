module.exports = {
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/KRISHI_MITHRA',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};
