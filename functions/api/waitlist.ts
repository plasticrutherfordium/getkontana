function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function onRequest(context: any) {
  const { request, env } = context;

  // Only allow POST
  if (request.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const emailRaw = typeof body.email === "string" ? body.email : "";
  const email = normaliseEmail(emailRaw);

  if (!email || !email.includes("@") || email.length > 254) {
    return new Response(JSON.stringify({ ok: false, error: "invalid_email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const createdAt = new Date().toISOString();

  await env.DB.prepare(
    "INSERT OR IGNORE INTO waitlist (email, created_at) VALUES (?, ?)"
  )
    .bind(email, createdAt)
    .run();

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
