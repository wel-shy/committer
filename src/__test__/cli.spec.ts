import {Cli} from "../cli";
import * as emojis from '../emojis.json';

describe('Cli', () => {
  let cli!: Cli
  let message: {
    type: string,
    scope: string,
    description: string,
    body: string,
    issue: string,
    emoji: string,
  };

  beforeEach(() => {
    cli = new Cli();
    message = {
      type: '',
      scope: '',
      description: '',
      body: '',
      issue: '',
      emoji: '',
    };
  })

  describe(".validate", function() {
    it("Should fail if commit message is not given", function() {
      message.type = 'feat';

      try {
        cli.validate(message);
      } catch (e) {
        expect(e.message).toContain('Commit must have a description');
      }
    });

    it("Should fail if commit has no type", function() {
      message.type = '';

      try {
        cli.validate(message);
      } catch (e) {
        expect(e.message).toContain('Commit must have a type');
      }
    });

    it("Should fail if issue is a string", function() {
      message.type = 'feat';
      message.description = 'some kind of commit';
      message.issue = 'hello';

      try {
        cli.validate(message);
      } catch (e) {
        expect(e.message).toContain('Issue must be an integer');
      }
    });

    it("Should fail if issue is a float", function() {
      message.type = 'feat';
      message.description = 'some kind of commit';
      message.issue = '1.22';

      try {
        cli.validate(message);
      } catch (e) {
        expect(e.message).toContain('Issue must be an integer');
      }
    });

    it("Should pass if issue is a integer", function() {
      message.type = 'feat';
      message.description = 'some kind of commit';
      message.issue = '1';

      cli.validate(message);
    });
  });

  describe('.filterResponses', () => {
    it('should return all on empty input', async () => {
      const responses: string[] = await cli.filterResponses('', '');
      expect(responses.length).toEqual(emojis.gitmojis.length);
    });

    it('should return nothing on non matching input', async () => {
      const responses: string[] = await cli.filterResponses('', '123456778');
      expect(responses.length).toEqual(0);
    });

    it('should return matching inputs', async () => {
      const responses: string[] = await cli.filterResponses('', 'test');
      responses.forEach(response => { expect(response.indexOf('test')).toBeGreaterThan(-1) })
    })
  });
});