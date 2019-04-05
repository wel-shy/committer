/**
 * Execute app
 *
 * @returns {Promise<void>}
 */
import App from "./app";

async function exe (): Promise<void> {
  const app: App = new App();
  const ans = await app.getAnswers();

  app.validate(ans);
  const msg = app.getCommitMessage(ans);
  app.commitChanges(msg);
}

exe().then();
