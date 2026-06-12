import { NextResponse } from "next/server";
import { isSupabasePublicMediaUrl } from "@/lib/cms/media-url";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const mediaUrl = requestUrl.searchParams.get("url");

  if (!mediaUrl || !isSupabasePublicMediaUrl(mediaUrl)) {
    return NextResponse.json({ error: "Invalid media URL." }, { status: 400 });
  }

  try {
    const range = request.headers.get("range");
    const upstream = await fetch(mediaUrl, {
      headers: range ? { Range: range } : undefined,
      cache: "no-store",
    });

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json(
        { error: "Media is unavailable." },
        { status: upstream.status }
      );
    }

    const headers = new Headers();
    for (const name of [
      "accept-ranges",
      "cache-control",
      "content-disposition",
      "content-length",
      "content-range",
      "content-type",
      "etag",
      "last-modified",
    ]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (!headers.has("cache-control")) {
      headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error("Public media proxy failed:", error);
    return NextResponse.json({ error: "Media is unavailable." }, { status: 502 });
  }
}
