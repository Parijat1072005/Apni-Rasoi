import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });
};

export const generateRefreshToken = (userId, role = 'user') => {
  const expiresIn = role === 'admin' ? '15m' : '4d';
  return jwt.sign({ id: userId, role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn,
  });
};

export const setRefreshTokenCookie = (res, token, role = 'user') => {
  const maxAge = role === 'admin' ? 15 * 60 * 1000 : 4 * 24 * 60 * 60 * 1000;
  res.cookie('refreshToken', token, {
    httpOnly: true,          // Not accessible via JS
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
    sameSite: 'strict',
    maxAge,
  });
};