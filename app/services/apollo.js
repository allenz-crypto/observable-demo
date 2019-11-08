import Service from "@ember/service";
import { makeExecutableSchema, addMockFunctionsToSchema } from "graphql-tools";
import typeDefs from "../graphql/schema";
import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { SchemaLink } from "apollo-link-schema";
import faker from "faker";
import gql from "graphql-tag";

const query = gql`
  query {
    selectedStudentId @client
  }
`;

const clientTypeDefs = gql`
  extend type Query {
    selectedStudentId: ID!
  }

  extend type Mutation {
    selectStudent(id: ID!): Boolean
  }
`;

export default class ApolloService extends Service {
  init() {
    super.init(...arguments);

    this.schema = makeExecutableSchema({
      typeDefs
    });

    const fakeStudents = [...Array(10).keys()].map(i => ({
      id: i.toString()
    }));

    const mocks = {
      Query() {
        return {
          students: () => {
            return fakeStudents;
          }
        };
      },
      Student() {
        return {
          name: `${faker.name.firstName()} ${faker.name.lastName()}`
        };
      },
      Mutation() {
        return {
          graduateStudent(_, { id }) {
            return {
              success: true,
              student: {
                id,
                graduated: true
              }
            };
          }
        };
      }
    };

    addMockFunctionsToSchema({
      schema: this.schema,
      mocks
    });

    const cache = new InMemoryCache();

    this.client = new ApolloClient({
      cache,
      link: new SchemaLink({ schema: this.schema }),
      typeDefs: clientTypeDefs,
      resolvers: {
        Mutation: {
          selectStudent: (_root, variables, { cache }) => {
            cache.writeQuery({
              query,
              data: {
                selectedStudentId: variables.id
              }
            });
            return {
              selectedStudentId: variables.id
            };
          }
        }
      }
    });

    cache.writeQuery({
      query,
      data: {
        selectedStudentId: null
      }
    });
  }
}
