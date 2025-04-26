import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'chisholmshevon@gmail.com',
    pass: 'iwreqizhemydxtxz',
  },
});

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    await transporter.sendMail({
      from: email,
      to: 'chisholmshevon@gmail.com',
      subject: `Portfolio Contact from ${name}`,
      text: message,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 