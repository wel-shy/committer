import * as inquirer from 'inquirer';
import * as emojis from './emojis.json';
import {exec} from 'child_process';

/**
 * Format a commit
 *
 * Uses gitmojis from: https://github.com/carloscuesta/gitmoji
 */
class App {
  /**
   * Get responses from command line
   * @returns {Promise<{type: string; scope: string; description: string; body: string; footer: string; issue: string}>}
   */
  public async getAnswers(): Promise<{
    type: string,
    scope: string,
    description: string,
    body: string,
    issue: string,
    emoji: string,
  }> {
    const commitTypes = [
      'fix',
      'feat',
      'chore',
      'docs',
      'style',
      'refactor',
      'perf',
      'test',
    ];

    const questions = [
      { type: 'list', name: 'type', message: 'Choose commit type:', choices: commitTypes },
      { type: 'list',
        name: 'emoji',
        message: 'Commit summary:',
        choices: emojis.gitmojis.map(gitmoji => `${gitmoji.emoji.trim()} - ${gitmoji.description.trim()}`),
        filter: (input: string) => {
          return new Promise(resolve => {
            const ans:
            { "emoji": string,
              "entity"?: string,
              "code": string,
              "description": string,
              "name": string }[] = emojis.gitmojis.filter( g => input.indexOf(g.emoji) > -1);
            resolve(ans[0].code);
          })
        }
      },
      { type: 'input', name: 'scope', message: 'Enter commit scope:'},
      { type: 'input', name: 'description', message: 'Enter commit message:'},
      { type: 'input', name: 'body', message: 'Enter commit body:'},
      { type: 'input', name: 'issue', message: 'References issue/PR:'}
    ];

    return await inquirer.prompt(questions);
  }

  /**
   * Validate responses.
   * @param {{type: string; scope: string; description: string; body: string; footer: string; issue: string; emoji: string}} answers
   */
  validate(answers: {
    type: string,
    scope: string,
    description: string,
    body: string,
    issue: string,
    emoji: string,
  }) {
    if (answers.type === '') throw new Error('Commit must have a type');
    if (answers.description === '') throw new Error('Commit must have a description');

    if (answers.issue !== '') {
      if (isNaN(parseInt(answers.issue))) {
        throw new Error('Issue must be an integer');
      }
    }
  }

  /**
   * Construct the commit message
   *
   * @param {{type: string; scope: string; description: string; body: string; footer: string; issue: string; emoji: string}} answers
   * @returns {string}
   */
  getCommitMessage(answers: {
    type: string,
    scope: string,
    description: string,
    body: string,
    issue: string,
    emoji: string,
  }) {
    let msg: string;
    const scope: string = answers.scope === '' ? answers.scope : `(${answers.scope})`;
    msg = `${answers.type}${scope}: ${answers.description} ${answers.emoji}`;

    if (answers.body !== '') {
      msg = `${msg}\n\n${answers.body}`;
    }

    if (answers.issue !== '') {
      msg = `${msg} #${answers.issue}`;
    }

    return msg.trim();
  }

  commitChanges(message: string): void {
    exec(`git commit -S -m '${message}'`, function (error: Error, stdout: string, stderr: string) {
      console.log(stdout);
      console.error(stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  }
}

/**
 * Execute app
 *
 * @returns {Promise<void>}
 */
async function main (): Promise<void> {
  const app: App = new App();
  const ans = await app.getAnswers();

  app.validate(ans);

  const msg = app.getCommitMessage(ans);

  app.commitChanges(msg);
}

main().then();
