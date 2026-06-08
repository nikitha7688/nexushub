// Stubbed email sender. In production this would hit a transactional email provider
// (Resend, Postmark, SES, etc.). For now everything is logged to the console so OTPs
// are visible during local development.

export interface Email {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(email: Email): Promise<void> {
  const line = "─".repeat(60);
  console.log(`\n${line}\n📨 EMAIL (stub) → ${email.to}\n   Subject: ${email.subject}\n   ${email.text}\n${line}`);
}

export async function sendOtpEmail(to: string, code: string, purpose: string): Promise<void> {
  const subjectByPurpose: Record<string, string> = {
    verify_email: "Verify your NexusHub email",
    mfa_login: "Your NexusHub sign-in code",
    password_reset: "Reset your NexusHub password",
  };
  await sendEmail({
    to,
    subject: subjectByPurpose[purpose] ?? "NexusHub code",
    text: `Your code is ${code}. It expires in 10 minutes.`,
  });
}