import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const {Schema} = mongoose;

const UserSchema = new Schema({
  lastName: String,
  firstName: String,
  email: {type: String, required: true, index: {unique: true}},
  password: { type: String, required: true, select: false },
  createdOn: { type: Date, default: Date.now },
  modifiedOn: Date,
  lastLogin: Date,
  isAdmin: {type: Boolean, default: false}
});

// hash the password before the user is saved
UserSchema.pre('save', function(next) {
  const user = this;

  // hash the password only if the password has been changed or user is new
  if (!user.isModified('password')) return next();

  // generate the hash
  bcrypt.hash(user.password, null, null, (err, hash) => {
    if (err) {
      return next(err);
    }

    // change the password to the hashed version
    user.password = hash;
    next();
  });
});

// method to compare a given password with the database hash
UserSchema.methods.comparePassword = function(password) {
  const user = this;

  return bcrypt.compareSync(password, user.password);
};

export default mongoose.model('User', UserSchema);
