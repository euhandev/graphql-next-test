/* eslint-disable @typescript-eslint/no-explicit-any */
import { graphqlRequest } from "./lib/graphql.js";

async function test() {
  const query = `
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
    console.log("Testing graphqlRequest directly...");
    const data = await graphqlRequest(query, variables);
    console.log("Data:", JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("Error:", JSON.stringify(err, null, 2));
  }
}

test();
