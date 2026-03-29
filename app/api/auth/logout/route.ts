import { graphqlRequest } from "@/lib/graphql";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const findCookie = (name: string) => {
      const v = cookieHeader
        .split(";")
        .map((s) => s.trim())
        .find((s) => s.startsWith(name + "="));
      return v ? v.split("=")[1] : undefined;
    };

    const accessToken = findCookie("accessToken");

    const query = `
      mutation logout {
        logout
      }
    `;

    if (accessToken) {
      try {
        await graphqlRequest(query, {}, accessToken);
      } catch (e) {
        // We ignore error logs from the server during logout if the session was already dead
        console.error("Logout mutation failed but continuing token cleanup:", e);
      }
    }

    // Explicitly expire cookies regardless of mutation success
    const expiredCookies = [
      `accessToken=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      `refreshToken=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    ];

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: [
        ["Set-Cookie", expiredCookies[0]],
        ["Set-Cookie", expiredCookies[1]],
        ["Content-Type", "application/json"],
      ],
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
