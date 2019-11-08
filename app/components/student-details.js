import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { inject as service } from "@ember/service";
import gql from "graphql-tag";
import { action } from "@ember/object";
import Observable from "zen-observable";
import { combineLatest } from "zen-observable/extras";

export default class StudentDetailComponent extends Component {
  @service apollo;

  @tracked student;

  constructor() {
    super(...arguments);
    this.loadStudentDetails();
  }

  willDestroy() {
    this.subscription.unsubscribe();
    super.willDestroy(...arguments);
  }

  async loadStudentDetails() {
    this.subscription = combineLatest(
      Observable.from(
        this.apollo.client.watchQuery({
          query: selectedStudentQuery
        })
      ),
      Observable.from(
        this.apollo.client.watchQuery({
          query: studentDetailsQuery
        })
      )
    ).subscribe(result => {
      const selectedStudentId = result[0].data.selectedStudentId;
      if (selectedStudentId != null) {
        this.student = result[1].data.students.find(s => s.id === selectedStudentId);
      } else {
        this.student = null;
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

const selectedStudentQuery = gql`
  query {
    selectedStudentId @client
  }
`;

const studentDetailsQuery = gql`
  query studentDetails {
    students {
      id
      name
      graduated
    }
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
