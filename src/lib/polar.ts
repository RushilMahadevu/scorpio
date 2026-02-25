import { Polar } from "@polar-sh/sdk";

if (!process.env.POLAR_ACCESS_TOKEN) {
  throw new Error("Missing POLAR_ACCESS_TOKEN environment variable");
}

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "production" // or "sandbox" if testing
});
