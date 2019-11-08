export default `
  type Query {
    students: [Student!]!
  }

  type Student {
    id: ID!
    name: String!
    graduated: Boolean!
  }

  type Mutation {
    graduateStudent(id: ID!): GraduateStudentPayload
  }

  type GraduateStudentPayload {
    success: Boolean!
    student: Student!
  }
`;
