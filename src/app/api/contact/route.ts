import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const CONTACT_EMAIL = process.env.EMAIL_USER || "chisholmshevon@gmail.com";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    // Email to contactee (you)
    await transporter.sendMail({
      from: email,
      to: CONTACT_EMAIL,
      subject: `New Portfolio Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">New Contact Message</h2>
          <div style="margin-bottom: 15px;">
            <p><strong style="color: #555;">From:</strong> ${name}</p>
            <p><strong style="color: #555;">Email:</strong> ${email}</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p><strong style="color: #555;">Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            This message was sent from your portfolio contact form.
          </p>
        </div>
      `,
    });

    // Confirmation email to sender
    await transporter.sendMail({
      from: CONTACT_EMAIL,
      to: email,
      subject: `Message Received - Thanks for reaching out!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Thank You for Your Message</h2>
          <p>Hello ${name},</p>
          <p>Thank you for reaching out through my portfolio website. I've received your message and will get back to you as soon as possible.</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #555;">Your Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <p>If you need to contact me urgently, please feel free to email me directly at ${CONTACT_EMAIL}.</p>
          <p>Best regards,</p>
          <p>Shevon Chisholm</p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
