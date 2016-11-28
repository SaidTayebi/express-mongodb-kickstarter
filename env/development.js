module.exports = {
  'port': process.env.PORT || 5000,
  'database': process.env.DB || 'mongodb://localhost:27017/kickstarter',
  'secret': process.env.SECRET || 'express-mongodb-kickstarter'
};
