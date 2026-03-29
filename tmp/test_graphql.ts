import { ApolloClient, InMemoryCache, HttpLink, gql } from "@apollo/client";

async function test() {
  const url = "https://ronijenkinsserver-production.up.railway.app/graphql";
  const client = new ApolloClient({
    link: new HttpLink({ uri: url, fetch }),
    cache: new InMemoryCache(),
  });

  const query = gql`
    mutation login($input: LoginInput!) {
      login(input: $input) {
        accessToken
        refreshToken
      }
    }
  `;

  const variables = {
    input: {
      email: "gilam37110@3dkai.com",
      password: "123456"
    }
  };

  try {
    console.log("Sending mutation to:", url);
    const res = await client.mutate({ mutation: query, variables });
    console.log("Response:", JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error("Error:", JSON.stringify(err, null, 2));
    if (err.networkError) {
        console.error("Network Error:", err.networkError.result);
    }
    if (err.graphQLErrors) {
        console.error("GraphQL Errors:", JSON.stringify(err.graphQLErrors, null, 2));
    }
  }
}

test();
