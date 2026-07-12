// Confirmation email. Uses Resend if RESEND_API_KEY is set, otherwise logs to stdout.
const { RESEND_API_KEY, EMAIL_FROM, PUBLIC_SITE_URL } = process.env;

function buildBody({ appointment, doctor, service }) {
    const start = new Date(appointment.start_time);

    const dateStr = start.toLocaleString("en-GB", {
        timeZone: "Asia/Dubai",
        dateStyle: "full",
        timeStyle: "short",
    });

    const manageUrl = `${PUBLIC_SITE_URL || "http://localhost:5173"}/manage/${appointment.reschedule_token}`;

    const reference = appointment.reschedule_token
        .slice(0, 8)
        .toUpperCase();

    const text = `
    Hi ${appointment.patient_name},

    Your appointment at Marina Pearl Dental Clinic is confirmed.

    Service: ${service.name}
    Doctor: ${doctor.name}
    When: ${dateStr}

    Reference: ${reference}

    Manage appointment:
    ${manageUrl}
    `;

    const html = 
        `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Appointment Confirmation</title>
    </head>

    <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
    <tr>
    <td align="center">

    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.08);">

    <!-- Header -->
    <tr>
    <td style="background:#0f766e;padding:40px;text-align:center;color:white;">
    <h1 style="margin:0;font-size:30px;">🦷 Marina Pearl Dental Clinic</h1>
    <p style="margin-top:10px;font-size:16px;opacity:.9;">
    Your Appointment is Confirmed
    </p>
    </td>
    </tr>

    <!-- Greeting -->
    <tr>
    <td style="padding:35px 40px 15px;">

    <h2 style="margin-top:0;color:#0f172a;">
    Hello ${appointment.patient_name},
    </h2>

    <p style="color:#475569;font-size:16px;line-height:1.7;">
    Thank you for choosing Marina Pearl Dental Clinic.
    Your appointment has been successfully booked.
    We look forward to welcoming you.
    </p>

    </td>
    </tr>

    <!-- Appointment Card -->
    <tr>
    <td style="padding:10px 40px;">

    <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">

    <tr>
    <td style="padding:20px;">

    <h3 style="margin-top:0;color:#0f766e;">
    Appointment Details
    </h3>

    <table width="100%" cellpadding="8">

    <tr>
    <td width="35%" style="color:#64748b;"><strong>Service</strong></td>
    <td style="color:#0f172a;">${service.name}</td>
    </tr>

    <tr>
    <td style="color:#64748b;"><strong>Dentist</strong></td>
    <td>${doctor.name}</td>
    </tr>

    <tr>
    <td style="color:#64748b;"><strong>Date & Time</strong></td>
    <td>${dateStr}</td>
    </tr>

    <tr>
    <td style="color:#64748b;"><strong>Reference</strong></td>
    <td><strong>${reference}</strong></td>
    </tr>

    </table>

    </td>
    </tr>

    </table>

    </td>
    </tr>

    <!-- CTA -->
    <tr>
    <td align="center" style="padding:35px;">

    <a href="${manageUrl}"
    style="
    background:#0f766e;
    color:#ffffff;
    text-decoration:none;
    padding:15px 34px;
    border-radius:8px;
    font-weight:bold;
    display:inline-block;
    font-size:16px;
    ">
    Manage Appointment
    </a>

    <p style="margin-top:18px;color:#64748b;font-size:14px;">
    Use this link to reschedule or cancel your appointment.
    </p>

    </td>
    </tr>

    <!-- Reminder -->
    <tr>
    <td style="padding:0 40px 30px;">

    <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#ecfeff;border-left:5px solid #0f766e;">

    <tr>
    <td style="padding:18px;color:#164e63;font-size:15px;line-height:1.6;">

    <strong>Appointment Reminder</strong><br><br>

    • Please arrive 10 minutes before your scheduled time.<br>
    • Bring any previous dental records if applicable.<br>
    • If you need to make changes, please use the button above.

    </td>
    </tr>

    </table>

    </td>
    </tr>

    <!-- Footer -->
    <tr>
    <td style="background:#f8fafc;padding:30px;text-align:center;">

    <p style="margin:0;font-weight:bold;color:#0f172a;">
    Marina Pearl Dental Clinic
    </p>

    <p style="margin:8px 0;color:#64748b;">
    Marina Plaza, Level 12<br>
    Dubai Marina, UAE
    </p>

    <p style="margin:0;color:#0f766e;">
    📞 +971 4 000 0000
    </p>

    <p style="margin-top:25px;font-size:12px;color:#94a3b8;">
    This is an automated confirmation email. Please do not reply.
    </p>

    </td>
    </tr>

    </table>

    </td>
    </tr>
    </table>

    </body>
    </html>
    `;

    return {
        text,
        html,
        manageUrl,
    };
}

export async function sendConfirmationEmail({ appointment, doctor, service }) {
    const { text, html, manageUrl } = buildBody({ appointment, doctor, service });
    if (!RESEND_API_KEY) {
        console.log('---- confirmation email (stub, RESEND_API_KEY not set) ----');
        console.log(`To: ${appointment.patient_email}`);
        console.log(text);
        console.log('---- end ----');
        return { stub: true, manageUrl };
    }
    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'onboarding@resend.dev',
                to: appointment.patient_email,
                subject: '🦷 Your Appointment is Confirmed',
                text,      // fallback for clients that don't render HTML
                html,      // rich email
            }),
        });
        if (!res.ok) {
            const body = await res.text();
            console.error('Resend failed:', res.status, body);
            return { sent: false, manageUrl };
        }
        return { sent: true, manageUrl };
    } catch (err) {
        console.error('Email error:', err.message);
        return { sent: false, manageUrl };
    }
}
