/**
 * Pizza Today KSA — Branded Email OTP Worker (Resend)
 * Deploy on Cloudflare Workers (or any Node/Edge runtime) with env.RESEND_API_KEY
 */
export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors });

    try {
      const { to, name, code } = await request.json();
      if (!to || !code) {
        return new Response(JSON.stringify({ error: 'Missing to or code' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
      }

      const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;900&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:'Cairo',Tahoma,Arial,sans-serif;color:#FAF9F6;direction:rtl;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0A0A0A;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#151515;border:1px solid #2A2A2A;border-radius:24px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:32px 28px 20px;border-bottom:1px solid #242424;background:linear-gradient(180deg,#1A1A1A 0%,#121212 100%);">
              <img src="https://loay109.github.io/pizza-today/assets/logo.webp" alt="بيتزا اليوم" width="140" style="display:block;height:auto;margin:0 auto 14px;" />
              <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#D8C3A5;">بيتزا اليوم • المملكة العربية السعودية</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;text-align:center;">
              <h1 style="margin:0 0 10px;font-size:22px;font-weight:900;color:#FAF9F6;">رمز التحقق الخاص بك</h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#A3A3A3;">
                حياك الله${name ? ' يا <strong style="color:#FAF9F6;">' + name + '</strong>' : ''}، استخدم الرمز التالي لإتمام دخولك في بيتزا اليوم:
              </p>
              <div style="display:inline-block;padding:18px 36px;background-color:#0A0A0A;border:1px solid #D8C3A5;border-radius:18px;font-size:34px;font-weight:900;letter-spacing:14px;color:#D8C3A5;direction:ltr;">
                ${code}
              </div>
              <p style="margin:24px 0 0;font-size:12px;color:#7A7A7A;">
                صالح لمدة 10 دقائق. إذا لم تطلب هذا الرمز، يمكنك تجاهل الرسالة.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:18px 24px;background-color:#0F0F0F;border-top:1px solid #222222;font-size:11px;color:#737373;">
              بيتزا اليوم — Pizza Today
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.RESEND_FROM || 'بيتزا اليوم <onboarding@resend.dev>',
          to: [to],
          subject: `رمز التحقق الخاص بك: ${code} — بيتزا اليوم`,
          html,
        }),
      });

      const data = await resendRes.json();
      return new Response(JSON.stringify({ ok: resendRes.ok, data }), {
        status: resendRes.ok ? 200 : 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  },
};
