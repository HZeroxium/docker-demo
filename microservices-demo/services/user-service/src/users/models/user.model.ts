import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import { UserRole } from './user.interface';

// Register enum for GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType()
@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Never expose password in JSON
      return ret;
    },
  },
})
export class User extends Document {
  @Field(() => ID)
  id: string;

  @Field()
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true, // Single index definition
  })
  email: string;

  @Prop({
    required: true,
    minlength: 6,
    select: false, // Don't include in queries by default
  })
  password: string;

  @Field()
  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  name: string;

  @Field(() => UserRole)
  @Prop({
    enum: UserRole,
    default: UserRole.USER,
    index: true,
  })
  role: UserRole;

  @Field()
  @Prop({
    default: true,
    index: true,
  })
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Compound indexes for better query performance
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save hook for additional validation
UserSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});
