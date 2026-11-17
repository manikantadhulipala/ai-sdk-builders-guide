import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Defaults to Resend's test sender, which only delivers to the account owner.
// Set RESEND_FROM to an address on a domain verified at resend.com/domains
// to send to customers.
export const FROM = process.env.RESEND_FROM || "Sal's Pizza <onboarding@resend.dev>";
