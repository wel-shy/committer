#!/usr/bin/env node

import App from "./app";
// @ts-ignore
import {version} from '../../package.json';

/**
 * Execute app
 *
 * @returns {Promise<void>}
 */
const commander = require('commander');

async function exe (): Promise<void> {
  commander
      .version(version, '-v --version')
      .description('Git wrapper for committing in the conventional commit format');

  commander
      .option('-s, --sign', 'sign commit with gpg key')
      .option('-a, --add', 'add all untracked changes')
      .option('-c, --config', 'edit committer config');

  commander.parse(process.argv);
  const options = {sign: commander.sign, add: commander.add};

  const app: App = new App();
  const ans = await app.getAnswers();
  app.validate(ans);
  const msg = app.getCommitMessage(ans);
  await app.commitChanges(msg, options);
}

exe().then();
