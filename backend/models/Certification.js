const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    certName: {
      type: String,
      required: [true, 'Please add a certification name'],
    },
    issuer: {
      type: String,
      required: [true, 'Please add an issuer'],
    },
    issueDate: {
      type: Date,
      required: [true, 'Please add an issue date'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please add an expiry date'],
    },
    certUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'expired'],
      default: 'active',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Compute status based on expiry date before saving
certificationSchema.pre('save', function (next) {
  this.status = this.expiryDate < new Date() ? 'expired' : 'active';
  next();
});

module.exports = mongoose.model('Certification', certificationSchema);
