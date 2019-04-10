import * as inquirer from 'inquirer';
import * as emojis from './emojis.json';
import {exec} from 'child_process';
import chalk from "chalk";

/**
 * Format a commit
 *
 * Uses gitmojis from: https://github.com/carloscuesta/gitmoji
 */
export default class App {

  constructor() {
  }

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
      'build',
      'ci',
      'chore',
      'docs',
      'feat',
      'fix',
      'perf',
      'refactor',
      'revert',
      'style',
      'test'
    ];

    const questions = [
      { type: 'autocomplete',
        name: 'emoji',
        message: 'Commit summary:',
        /**
         * Get source for emoji list.
         * @param answersSoFar
         * @param input
         */
        source: (answersSoFar: any, input: string) => {
          return new Promise(resolve => {
            // map to string
            const mapped: string[] = emojis.gitmojis.map(gitmoji => `${gitmoji.emoji.trim()} - ${gitmoji.description.trim()}`);

            // format input
            if (input === undefined) {
              input = '';
            }
            input = input.toLowerCase().trim();

            // return matches
            resolve(mapped.filter(gitmoji => gitmoji.toLowerCase().indexOf(input) > -1))
          })
        },
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
      { type: 'list', name: 'type', message: 'Choose commit type:', choices: commitTypes },
      { type: 'input', name: 'scope', message: 'Enter commit scope (optional):'},
      { type: 'input', name: 'description', message: 'Enter commit title:'},
      { type: 'input', name: 'body', message: 'Enter commit body (optional):'},
      { type: 'input', name: 'issue', message: 'References issue/PR (optional):'}
    ];

    // TODO: find a better way to do this with typescript.
    inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
    return await inquirer.prompt(questions);
  }

  /**
   * Validate responses.
   * @param {{type: string; scope: string; description: string; body: string; footer: string; issue: string; emoji: string}} answers
   */
  public validate(answers: {
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
  public getCommitMessage(answers: {
    type: string,
    scope: string,
    description: string,
    body: string,
    issue: string,
    emoji: string,
  }) {
    let msg: string;

    // add a scope if given
    const scope: string = answers.scope === '' ? answers.scope : `(${answers.scope})`;

    // add description and emoji
    msg = `${answers.type}${scope}: ${answers.description} ${answers.emoji}`;

    // append body if it exists.
    if (answers.body !== '') {
      msg = `${msg}\n\n${answers.body}`;
    }

    // add issue if given
    if (answers.issue !== '') {
      msg = `${msg} #${answers.issue}`;
    }

    // trim whitespace.
    return msg.trim();
  }

  /**
   * Commit to git.
   * todo: format errors with chalk.
   *
   * @param message
   * @param options
   */
  public async commitChanges(message: string, options?: { add: boolean, sign: boolean }): Promise<string> {
    let cmd: string = 'git commit';

    // apply options
    if (options) {
      // add all untracked in directory.
      if (options.add) {
        await this.executeCommand('git add .');
        console.log(chalk.green('Staged untracked files'))
      }

      if (options.sign) {
        cmd = `${cmd} -S`;
      }
    }

    cmd = `${cmd} -m '${message}'`;

    try {
      const response: string = await this.executeCommand(cmd);
      console.log(chalk.green('Changes committed'));
      return 'commit successful';
    } catch (e) {
     throw e;
    }
  }

  /**
   * Execute a command
   * @param cmd
   */
  private executeCommand(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if(error) reject(error);
        resolve(stdout.trim());
      })
    });
  }
}
