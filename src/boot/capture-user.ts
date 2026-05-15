export interface CaptureUserIdDeps {
  readonly capturedUserIds: Set<string>;
  readonly getSettingsForUser: (userId: string) => Promise<unknown>;
  readonly promptOrphanReviewIfAny: (userId: string) => Promise<void>;
  readonly runMassModuleMigrationIfNeeded: (userId: string) => Promise<void>;
  readonly runMassCharacterMigrationIfNeeded: (userId: string) => Promise<void>;
  // Sends the initial missing-permissions notification to the newly captured
  // user. Without this, a user who connects after permissions finish loading
  // never sees the modal until perms change at runtime.
  readonly notifyMissingPermsForUser: (userId: string) => void;
  readonly log: { readonly info: (m: string) => void; readonly warn: (m: string) => void };
  readonly errMsg: (e: unknown) => string;
}

const ORPHAN_REVIEW_DEFER_MS = 3000;
const MASS_MIGRATION_DEFER_MS = 3000;

export function makeCaptureUserId(deps: CaptureUserIdDeps): (userId: string | undefined, where: string) => void {
  const {
    capturedUserIds,
    getSettingsForUser,
    promptOrphanReviewIfAny,
    runMassModuleMigrationIfNeeded,
    runMassCharacterMigrationIfNeeded,
    log,
    errMsg,
  } = deps;

  const { notifyMissingPermsForUser } = deps;
  return (userId, where) => {
    if (!userId || capturedUserIds.has(userId)) return;
    capturedUserIds.add(userId);
    log.info(`captureUserId: bootstrap from ${where} userId=${userId}`);
    try { notifyMissingPermsForUser(userId); } catch (err) {
      log.warn(`captureUserId: notifyMissingPermsForUser failed for user=${userId}: ${errMsg(err)}`);
    }
    void getSettingsForUser(userId).catch((err) => {
      log.warn(`captureUserId: settings preload failed for user=${userId}: ${errMsg(err)}`);
    });
    // Deferred so orphan-review doesn't compete with chat-open work.
    setTimeout(() => {
      void promptOrphanReviewIfAny(userId).catch((err) => {
        log.warn(`captureUserId: orphan-review prompt failed: ${errMsg(err)}`);
      });
    }, ORPHAN_REVIEW_DEFER_MS);
    // Modules first since characters attach to them, then characters.
    setTimeout(() => {
      void (async () => {
        try {
          await runMassModuleMigrationIfNeeded(userId);
        } catch (err) {
          log.warn(`captureUserId: mass module migration failed: ${errMsg(err)}`);
        }
        try {
          await runMassCharacterMigrationIfNeeded(userId);
        } catch (err) {
          log.warn(`captureUserId: mass character migration failed: ${errMsg(err)}`);
        }
      })();
    }, MASS_MIGRATION_DEFER_MS);
  };
}
