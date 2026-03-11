import crypto from 'crypto';
import User from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { generateAccessToken, generateRefreshToken, setRefreshTokenCookie } from '../utils/generateToken.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';

// ── Register ──────────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.error(res, 'Email already registered', 400);
    }

    const user = await User.create({ name, email, password, phone });

    // Send welcome email (non-blocking)
    const { subject, html } = emailTemplates.welcome(name);
    sendEmail({ to: email, subject, html }).catch(() => {});

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return ApiResponse.success(res, {
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        avatar: user.avatar,
      },
      accessToken,
    }, 'Registered successfully', 201);

  } catch (error) {
    next(error);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    if (user.isBlocked) {
      return ApiResponse.error(res, 'Your account has been suspended. Contact support.', 403);
    }

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return ApiResponse.success(res, {
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        avatar: user.avatar,
      },
      accessToken,
    }, 'Login successful');

  } catch (error) {
    next(error);
  }
};

// ── Refresh Access Token ──────────────────────────────────────────────────────
export const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return ApiResponse.error(res, 'No refresh token', 401);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return ApiResponse.error(res, 'Invalid or expired refresh token', 401);
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return ApiResponse.error(res, 'Refresh token mismatch', 401);
    }

    const newAccessToken  = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, newRefreshToken);

    return ApiResponse.success(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await User.findOneAndUpdate(
        { refreshToken: token },
        { refreshToken: null },
        { new: true }
      );
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return ApiResponse.success(res, {}, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// ── Get Current User ──────────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name images basePrice slug');
    return ApiResponse.success(res, { user }, 'User fetched');
  } catch (error) {
    next(error);
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return ApiResponse.error(res, 'Email is required', 400);

    const user = await User.findOne({ email });
    // Always respond the same way to prevent email enumeration
    if (!user) {
      return ApiResponse.success(res, {}, 'If that email exists, a reset link has been sent.');
    }

    const rawToken   = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetToken   = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    const { subject, html } = emailTemplates.passwordReset(user.name, resetUrl);

    try {
      await sendEmail({ to: user.email, subject, html });
    } catch {
      user.passwordResetToken   = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return ApiResponse.error(res, 'Email could not be sent. Try again later.', 500);
    }

    return ApiResponse.success(res, {}, 'If that email exists, a reset link has been sent.');
  } catch (error) {
    next(error);
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return ApiResponse.error(res, 'Password must be at least 8 characters', 400);
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) return ApiResponse.error(res, 'Token is invalid or has expired', 400);

    user.password             = password;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken         = undefined;
    await user.save();

    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

    return ApiResponse.success(res, {}, 'Password reset successful. Please log in.');
  } catch (error) {
    next(error);
  }
};

// ── Change Password (authenticated) ──────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return ApiResponse.error(res, 'Current password is incorrect', 400);
    }

    if (newPassword.length < 8) {
      return ApiResponse.error(res, 'New password must be at least 8 characters', 400);
    }

    user.password = newPassword;
    await user.save();

    return ApiResponse.success(res, {}, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};