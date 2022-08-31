const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      requied: [true, 'Last name is required.'],
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, 'email field is required.'],
      unique: true,
      validate: [validator.isEmail, 'Please enter valid email.'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      minlength: 6,
      required: [true, 'please enter password'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [false, 'confirm password is required.'],
      validate: {
        validator: function (v) {
          return v === this.password;
        },
        message: 'Password and confirm password should be same.',
      },
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpireAt: Date,
    select: {
      type: Boolean,
      select: false,
      default: true,
    },
  },
  { versionKey: false }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangeAt = Date.now();
  next();
});

userSchema.pre(/^find/, async function (next) {
  this.find({ select: { $ne: false } });
  next();
});

userSchema.methods.validatePassword = async function (
  userPassword,
  hashPassword
) {
  return await bcrypt.compare(userPassword, hashPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTtimestamp) {
  if (this.passwordChangeAt) {
    const changeAt = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
    return JWTtimestamp < changeAt;
  }

  return false;
};

userSchema.methods.createForgotPasswordToken = function () {
  let resetToken = crypto.randomBytes(32).toString('hex');

  const hash = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetToken = hash;
  this.passwordResetExpireAt = Date.now() + 10 * 60 * 1000; // 10 min
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
