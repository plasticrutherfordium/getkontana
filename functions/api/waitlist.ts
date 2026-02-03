function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

function jsonError(code: string, status: number) {
  return new Response(JSON.stringify({ ok: false, code }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function verifyTurnstileToken(token: string, secret: string) {
  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    return { ok: false };
  }

  const data = (await response.json()) as { success?: boolean };
  return { ok: data.success === true };
}

export async function onRequest(context: any) {
  const { request, env } = context;
  const requestId =
    request.headers.get("cf-ray") ??
    request.headers.get("cf-request-id") ??
    crypto.randomUUID();

  // Only allow POST
  if (request.method !== "POST") {
    return jsonError("method_not_allowed", 405);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid_json", 400);
  }

  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  const turnstileSecret =
    typeof env.TURNSTILE_SECRET === "string" ? env.TURNSTILE_SECRET : "";

  if (!turnstileToken) {
    console.log(
      JSON.stringify({
        event: "turnstile_failed",
        reason: "missing_token",
        requestId,
      })
    );
    return jsonError("turnstile_missing_token", 400);
  }

  if (!turnstileSecret) {
    console.log(
      JSON.stringify({
        event: "turnstile_failed",
        reason: "missing_secret",
        requestId,
      })
    );
    return jsonError("turnstile_missing_secret", 400);
  }

  const turnstileCheck = await verifyTurnstileToken(
    turnstileToken,
    turnstileSecret
  );

  if (!turnstileCheck.ok) {
    console.log(
      JSON.stringify({
        event: "turnstile_failed",
        reason: "verification_failed",
        requestId,
      })
    );
    return jsonError("turnstile_failed", 403);
  }

  const emailRaw = typeof body.email === "string" ? body.email : "";
  const email = normaliseEmail(emailRaw);

  if (!email || !email.includes("@") || email.length > 254) {
    return jsonError("invalid_email", 400);
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
