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
