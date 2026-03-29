/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApolloClient, InMemoryCache, HttpLink, gql } from "@apollo/client";

export async function graphqlRequest(
  query: string,
  variables?: any,
  token?: string,
) {
  const url = process.env.NEXT_PUBLIC_GRAPHQL_URL || process.env.GRAPHQL_URL || "https://ronijenkinsserver-production.up.railway.app/graphql";
  if (!url) throw new Error("GRAPHQL_URL is not set in environment variables.");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const client = new ApolloClient({
    ssrMode: true,
    link: new HttpLink({ uri: url, fetch: globalThis.fetch as any, headers }),
    cache: new InMemoryCache(),
  });

  const doc = gql`
    ${query}
  `;

  if (/^\s*mutation/i.test(query)) {
    const res = await client.mutate({ mutation: doc, variables });
    if ((res as any).errors) throw (res as any).errors;
    return (res as any).data;
  }

  const res = await client.query({
    query: doc,
    variables,
    fetchPolicy: "network-only",
  });
  if ((res as any).errors) throw (res as any).errors;
  return (res as any).data;
}

export default graphqlRequest;
