import App from "../App";
import { exec } from "child_process";
import { CliAnswer } from "../CliAnswer";

jest.mock("child_process", () => {
  return {
    exec: jest.fn((cmd: string, cb: any) => {
      if (cmd.indexOf("error") != -1) {
        throw new Error();
      } else {
        return cb(null, "called", "");
      }
    })
  };
});

describe("App", () => {
  let app!: App;
  let message: CliAnswer;

  beforeEach(() => {
    app = new App();
    message = {
      type: "",
      scope: "",
      description: "",
      body: "",
      issue: "",
      emoji: ""
    };
  });

  describe(".getCommitMessage", () => {
    it("Should generate a commit message", function() {
      message.type = "feat";
      message.description = "some kind of commit";

      const msg = app.getCommitMessage(message);

      expect(msg).toContain(message.type);
      expect(msg).toContain(message.description);
    });

    it("Should generate a commit message with scope", function() {
      message.type = "feat";
      message.description = "some kind of commit";
      message.scope = "lang";

      const msg = app.getCommitMessage(message);

      expect(msg).toContain(message.type);
      expect(msg).toContain(message.description);
      expect(msg).toContain(`(${message.scope})`);
    });

    it("Should generate a commit message with a body", function() {
      message.type = "feat";
      message.description = "some kind of commit";
      message.scope = "lang";
      message.body = "message body";

      const msg = app.getCommitMessage(message);

      expect(msg).toContain(message.type);
      expect(msg).toContain(message.description);
      expect(msg).toContain(`(${message.scope})`);
      expect(msg).toContain(message.body);
    });

    it("Should generate a commit message with issue", function() {
      message.type = "feat";
      message.description = "some kind of commit";
      message.scope = "lang";
      message.issue = "1";

      const msg = app.getCommitMessage(message);

      expect(msg).toContain(message.type);
      expect(msg).toContain(message.description);
      expect(msg).toContain(`#${message.issue}`);
    });
  });

  describe(".commitChanges", () => {
    it("Should commit changes", async () => {
      const testString = "test string";
      const response = await app.commitChanges(testString);
      expect(exec).toBeCalledWith(
        `git commit -m '${testString}'`,
        expect.anything()
      );
    });

    it("Should commit changes and stage untracked changes", async () => {
      const testString = "test string";
      const response = await app.commitChanges(testString, {
        add: true,
        sign: false
      });
      expect(exec).toBeCalledWith(`git add .`, expect.anything());

      expect(exec).toBeCalledWith(
        `git commit -m '${testString}'`,
        expect.anything()
      );
    });

    it("Should commit changes and sign the commit", async () => {
      const testString = "test string";
      const response = await app.commitChanges(testString, {
        add: false,
        sign: true
      });
      expect(exec).toBeCalledWith(
        `git commit -S -m '${testString}'`,
        expect.anything()
      );
    });

    it("Should commit changes, sign the commit, and add untracked", async () => {
      const testString = "test string";
      const response = await app.commitChanges(testString, {
        add: true,
        sign: true
      });
      expect(exec).toBeCalledWith(`git add .`, expect.anything());
      expect(exec).toBeCalledWith(
        `git commit -S -m '${testString}'`,
        expect.anything()
      );
    });

    it("Should throw an error on bad commit", async () => {
      const testString = "error";
      await expect(
        app.commitChanges(testString, {
          add: true,
          sign: true
        })
      ).rejects.toThrow();
    });
  });
});
