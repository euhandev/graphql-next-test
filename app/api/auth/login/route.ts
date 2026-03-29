import { graphqlRequest } from "@/lib/graphql";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const query = `
      mutation login($input: LoginInput!) {
        login(input: $input) {
          accessToken
          refreshToken
        }
      }
    `;
    const variables = { input: { email, password } };

    try {
      console.log("Attempting GraphQL login for:", email);
      const data = await graphqlRequest(query, variables);
      console.log("GraphQL login raw data received:", JSON.stringify(data, null, 2));
      
      // Flexible extraction: try both data.login and data directly
      const tokens = data?.login || data;

      if (!tokens || !tokens.accessToken) {
        console.error("Login failed: Tokens not found in response", data);
        return new Response(
          JSON.stringify({ error: "Invalid login credentials or response structure" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const { accessToken, refreshToken } = tokens;

      // Set cookies with reasonable expiry (7 days for access, 30 days for refresh)
      const cookies = [
        `accessToken=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
        `refreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
      ];

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: [
          ["Set-Cookie", cookies[0]],
          ["Set-Cookie", cookies[1]],
          ["Content-Type", "application/json"],
        ],
      });
    } catch (err: any) {
      console.error("GraphQL login error:", err);
      // Handle GraphQL errors specifically if possible
      const errorMessage = Array.isArray(err)
        ? err[0]?.message || "GraphQL mutation error"
        : err?.message || String(err);

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    console.error("Internal login route error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
