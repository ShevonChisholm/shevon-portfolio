import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const maxLengths = {
  name: 120,
  email: 254,
  subject: 160,
  message: 5000,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

function fieldAsString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateContactPayload(payload: ContactPayload) {
  const name = fieldAsString(payload.name);
  const email = fieldAsString(payload.email);
  const subject = fieldAsString(payload.subject);
  const message = fieldAsString(payload.message);

  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };
  if (!emailPattern.test(email)) return { error: "Enter a valid email address." };
  if (!message) return { error: "Message is required." };

  if (name.length > maxLengths.name) {
    return { error: `Name must be ${maxLengths.name} characters or fewer.` };
  }

  if (email.length > maxLengths.email) {
    return { error: `Email must be ${maxLengths.email} characters or fewer.` };
  }

  if (subject.length > maxLengths.subject) {
    return { error: `Subject must be ${maxLengths.subject} characters or fewer.` };
  }

  if (message.length > maxLengths.message) {
    return { error: `Message must be ${maxLengths.message} characters or fewer.` };
  }

  return {
    value: {
      name,
      email,
      subject,
      message,
    },
  };
}

function notificationText({
  name,
  email,
  subject,
  message,
  timestamp,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}) {
  return [
    `Name: ${name}`,
    `Email: ${email}`,
    subject ? `Subject: ${subject}` : null,
    `Timestamp: ${timestamp}`,
    "",
    "Message:",
    message,
    "",
    "Admin note: This message was also saved in the Portfolio CMS.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

async function sendNotificationEmail({
  name,
  email,
  subject,
  message,
  timestamp,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFICATION_EMAIL;

  if (!apiKey) {
    console.info("Contact notification skipped: RESEND_API_KEY is missing.");
    return;
  }

  if (!to) {
    console.info(
      "Contact notification skipped: CONTACT_NOTIFICATION_EMAIL is missing."
    );
    return;
  }

  const resend = new Resend(apiKey);
  const fromAddress =
    process.env.RESEND_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";
  const replyToAddress = email;

  await resend.emails.send({
    from: fromAddress,
    to,
    subject: `New portfolio message from ${name}`,
    replyTo: replyToAddress,
    text: notificationText({ name, email, subject, message, timestamp }),
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContactPayload;
    const result = validateContactPayload(payload);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.value;
    const timestamp = new Date().toISOString();
    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject: subject || null,
      message,
      source: "portfolio-contact-form",
      is_read: false,
      archived: false,
    });

    if (error) throw new Error(error.message);

    try {
      await sendNotificationEmail({
        name,
        email,
        subject,
        message,
        timestamp,
      });
    } catch (notificationError) {
      console.error("Contact notification email failed:", notificationError);
    }

    return NextResponse.json({ message: "Message saved successfully" });
  } catch (error) {
    console.error("Error saving contact message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
