import { Polar } from "@polar-sh/sdk";

if (!process.env.POLAR_ACCESS_TOKEN) {
  console.error("[Polar] Missing POLAR_ACCESS_TOKEN — checkout and webhooks will fail.");
}

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
  server: process.env.POLAR_ENV === "sandbox" ? "sandbox" : "production",
});

export { polar };
