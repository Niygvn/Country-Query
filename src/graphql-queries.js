// src/graphql-queries.js
import { gql, request } from "graphql-request";

const endpoint = "https://countries.trevorblades.com/";

export const fetchCountries = async () => {
  const query = gql`
    {
      countries {
        code
        name
        continent {
          name
        }
        languages {
          code
          name
        }
        currency
      }
    }
  `;

  try {
    const data = await request(endpoint, query);
    return data.countries;
  } catch (error) {
    console.error("GraphQL Request Failed", error);
    throw error;
  }
};
