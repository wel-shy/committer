import { CLI } from "../CLI";
import * as emojis from "../emojis.json";
import { CliAnswer } from "../CliAnswer";
import * as inquirer from "inquirer";

jest.mock("inquirer", () => {
  return {
    prompt: jest.fn((questions: any) => {
      return {
        type: "",
        scope: "",
        description: "",
        body: "",
        issue: "",
        emoji: ""
      };
    }),
    registerPrompt: jest.fn(
      (name: string, mod: inquirer.PromptModule): void => {}
    )
  };
});

describe("Cli", () => {
  let cli!: CLI;
  let message: CliAnswer;

  beforeEach(() => {
    cli = new CLI();
    message = {
      type: "",
      scope: "",
      description: "",
      body: "",
      issue: "",
      emoji: ""
    };
  });

  describe(".validate", function() {
    it("Should fail if commit message is not given", function() {
      message.type = "feat";

      try {
        cli.validate(message);
      } catch (e) {
        expect(e.message).toContain("Commit must have a description");
      }
    });

    it("Should fail if commit has no type", function() {
      message.type = "";

      try {
        cli.validate(message);
      } catch (e) {
        expect(e.message).toContain("Commit must have a type");
      }
    });

    it("Should fail if issue is a string", function() {
      message.type = "feat";
      message.description = "some kind of commit";
      message.issue = "hello";

      try {
        cli.validate(message);
      } catch (e) {
        expect(e.message).toContain("Issue must be an integer");
      }
    });

    it("Should fail if issue is a float", function() {
      message.type = "feat";
      message.description = "some kind of commit";
      message.issue = "1.22";

      try {
        cli.validate(message);
      } catch (e) {
        expect(e.message).toContain("Issue must be an integer");
      }
    });

    it("Should pass if issue is a integer", function() {
      message.type = "feat";
      message.description = "some kind of commit";
      message.issue = "1";

      cli.validate(message);
    });
  });

  describe(".filterResponses", () => {
    it("Should return all on empty input", async () => {
      const responses: string[] = await cli.filterResponses("", "");
      expect(responses.length).toEqual(emojis.gitmojis.length);
    });

    it("Should return nothing on non matching input", async () => {
      const responses: string[] = await cli.filterResponses("", "123456778");
      expect(responses.length).toEqual(0);
    });

    it("Should return matching inputs", async () => {
      const responses: string[] = await cli.filterResponses("", "test");
      responses.forEach(response => {
        expect(response.indexOf("test")).toBeGreaterThan(-1);
      });
    });
  });

  describe(".getAnswers", () => {
    it("Should populate the question list", async () => {
      const reponses: any = await cli.getAnswers();
      expect(inquirer.prompt).toHaveBeenCalled();
    });
  });
});
