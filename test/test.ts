import { expect } from "chai";
import App from "../src/app";

const app: App = new App();
const message = {
  type: '',
  scope: '',
  description: '',
  body: '',
  issue: '',
  emoji: '',
};

describe("App.validate()", function() {
  it("Should fail if commit message is not given", function() {
    message.type = 'feat';

    try {
      app.validate(message);
    } catch (e) {
      expect(e.message).to.contain('Commit must have a description');
    }
  });

  it("Should fail if commit has no type", function() {
    message.type = '';

    try {
      app.validate(message);
    } catch (e) {
      expect(e.message).to.contain('Commit must have a type');
    }
  });

  it("Should fail if issue is a string", function() {
    message.type = 'feat';
    message.description = 'some kind of commit';
    message.issue = 'hello';

    try {
      app.validate(message);
    } catch (e) {
      expect(e.message).to.contain('Issue must be an integer');
    }
  });

  it("Should fail if issue is a float", function() {
    message.type = 'feat';
    message.description = 'some kind of commit';
    message.issue = '1.22';

    try {
      app.validate(message);
    } catch (e) {
      expect(e.message).to.contain('Issue must be an integer');
    }
  });

  it("Should pass if issue is a integer", function() {
    message.type = 'feat';
    message.description = 'some kind of commit';
    message.issue = '1';

    app.validate(message);
  });
});

describe("App.getCommitMessage()", () => {
  it('Should generate a commit message', function() {
    message.type = 'feat';
    message.description = 'some kind of commit';

    const msg = app.getCommitMessage(message);

    expect(msg).to.contain(message.type);
    expect(msg).to.contain(message.description);
  });

  it('Should generate a commit message with scope', function() {
    message.type = 'feat';
    message.description = 'some kind of commit';
    message.scope = 'lang';

    const msg = app.getCommitMessage(message);

    expect(msg).to.contain(message.type);
    expect(msg).to.contain(message.description);
    expect(msg).to.contain(`(${message.scope})`);
  });

  it('Should generate a commit message with issue', function() {
    message.type = 'feat';
    message.description = 'some kind of commit';
    message.scope = 'lang';
    message.issue = '1';

    const msg = app.getCommitMessage(message);

    expect(msg).to.contain(message.type);
    expect(msg).to.contain(message.description);
    expect(msg).to.contain(`#${message.issue}`);
  });
});
