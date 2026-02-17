export const generateToken = (user, statusCode, message, res) => {
  const token = user.generateToken();

  res.status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      secure: true,           // ✅ REQUIRED for HTTPS (Render/Vercel)
      sameSite: "None",       // ✅ REQUIRED for cross-origin
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message,
      data: { user },
    });
};
