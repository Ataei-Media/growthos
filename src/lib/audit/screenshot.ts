import "server-only";
import crypto from "node:crypto";
import { getServerEnv } from "@/lib/env";

/**
 * Build a signed ScreenshotOne URL for a target site. The image is rendered
 * on demand when the URL is requested, so no network call happens here.
 */
export function buildScreenshotUrl(targetUrl: string): string {
  const env = getServerEnv();
  const params = new URLSearchParams({
    access_key: env.SCREENSHOTONE_ACCESS_KEY,
    url: targetUrl,
    viewport_width: "1280",
    viewport_height: "800",
    device_scale_factor: "1",
    format: "jpg",
    image_quality: "82",
    block_cookie_banners: "true",
    block_ads: "true",
    cache: "true",
    cache_ttl: "86400",
    full_page: "false",
  });
  const query = params.toString();
  const signature = crypto
    .createHmac("sha256", env.SCREENSHOTONE_SECRET_KEY)
    .update(query)
    .digest("hex");
  return `https://api.screenshotone.com/take?${query}&signature=${signature}`;
}
