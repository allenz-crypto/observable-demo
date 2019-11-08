import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | class-room', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:class-room');
    assert.ok(route);
  });
});
