import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import gql from 'graphql-tag';
import { action } from '@ember/object';

export default class StudentsPageComponent extends Component {
  @service apollo;

  @tracked students;

  constructor() {
    super(...arguments);
    this.loadStudents();
  }

  willDestroy() {
    this.subscription.unsubscribe();
    super.willDestroy(...arguments);
  }

  async loadStudents() {
    this.subscription = this.apollo.client.watchQuery({
      query
    }).subscribe(result => {
      this.students = result.data.students;
    });
  }

  @action
  selectStudent(id) {
    this.apollo.client.mutate({
      mutation: selectStudentMutation,
      variables: {
        id
      }
    });
  }

  @action
  graduateStudent(id) {
    this.apollo.client.mutate({
      mutation: graduateMutation,
      variables: {
        id
      }
    });
  }
}

const query = gql`
  query {
    students {
      id
      name
      graduated
    }
  }
`;

const selectStudentMutation = gql`
  mutation($id: ID!) {
    selectStudent(id: $id) @client
  }
`;

const graduateMutation = gql`
  mutation($id: ID!) {
    graduateStudent(id: $id) {
      success
      student {
        id
        graduated
      }
    }
  }
`;
