const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendResetEmail = async ({ email, name, resetUrl }) => {
  const { data, error } = await resend.emails.send({
    from: "SQLForge <onboarding@resend.dev>",
    to: [email],
    subject: "Reset your SQLForge password",
    html: `
      <div style="margin:0;padding:40px 20px;background:#050505;font-family:Arial,sans-serif;color:#ffffff;">
        <div style="max-width:600px;margin:0 auto;background:#111111;border:1px solid #2a2a2a;border-radius:16px;padding:40px;">

          <div style="text-align:center;margin-bottom:30px;">
            <h1 style="margin:0;color:#ef4444;font-size:32px;">
              SQLForge
            </h1>
            <p style="color:#888888;margin-top:8px;">
              Password Recovery
            </p>
          </div>

          <h2 style="color:#ffffff;">
            Hello ${name || "there"},
          </h2>

          <p style="color:#cccccc;line-height:1.7;">
            We received a request to reset your SQLForge account password.
          </p>

          <p style="color:#cccccc;line-height:1.7;">
            Click the button below to create a new password.
            This link will expire in <strong style="color:#ffffff;">15 minutes</strong>.
          </p>

          <div style="text-align:center;margin:35px 0;">
            <a
              href="${resetUrl}"
              style="
                display:inline-block;
                padding:14px 28px;
                background:#dc2626;
                color:#ffffff;
                text-decoration:none;
                border-radius:8px;
                font-weight:bold;
              "
            >
              Reset My Password
            </a>
          </div>

          <p style="color:#888888;font-size:13px;line-height:1.6;">
            If you did not request a password reset, you can safely ignore this
            email. Your password will remain unchanged.
          </p>

          <div style="margin-top:35px;padding-top:20px;border-top:1px solid #292929;text-align:center;">
            <p style="margin:0;color:#666666;font-size:12px;">
              SQLForge • Forge Your SQL Skills
            </p>
            <p style="margin:6px 0 0;color:#ef4444;font-size:12px;">
              Built with precision by Joe
            </p>
          </div>

        </div>
      </div>
    `,
  });

if (error) {
  console.error("RESEND ERROR:", error);
  throw new Error(
    error.message || "Failed to send password reset email."
  );
}

  return data;
};

module.exports = sendResetEmail;