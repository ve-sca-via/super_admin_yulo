import { ApiError } from '../utils/ApiError.js';

// Only 'veg-handling' is confirmed by the frontend: OnboardingContext.jsx's initial mock
// `training` state has it as module 2 of 3, duration 8m20s (8*60+20). 'app-basics' and
// 'safety-and-conduct' are reasonable placeholder names for a delivery-partner curriculum's
// first/third modules, invented here since no other module names exist anywhere in this
// codebase — their durations are placeholders too, veg-handling's is the one real figure.
export const TRAINING_MODULES = [
  { moduleId: 'app-basics', label: 'App Basics & Navigation', durationSeconds: 4 * 60 },
  { moduleId: 'veg-handling', label: 'Veg Handling SOP', durationSeconds: 8 * 60 + 20 },
  { moduleId: 'safety-and-conduct', label: 'Safety & Delivery Conduct', durationSeconds: 5 * 60 },
];

// Matches TrainingComplete.jsx's "9 / 10" display convention.
export const MAX_QUIZ_SCORE = 10;

const moduleIndexOf = (moduleId) => TRAINING_MODULES.findIndex((m) => m.moduleId === moduleId);

// `currentModuleId: null` is ambiguous on its own — it means BOTH "training not started yet" and
// "training fully finished" (completeModule sets it to null after the last module). Only
// certificateStatus disambiguates the two; never fall back to TRAINING_MODULES[0] without
// checking it first, or a finished partner gets incorrectly reopened into module 1.
const isTrainingComplete = (partner) => partner.training?.certificateStatus === 'issued';

const currentModuleIdOf = (partner) => partner.training?.currentModuleId ?? TRAINING_MODULES[0].moduleId;

export const getTrainingStatus = (partner) => {
  if (isTrainingComplete(partner)) {
    return {
      moduleId: null,
      moduleLabel: null,
      moduleIndex: null,
      totalModules: TRAINING_MODULES.length,
      watchedSeconds: 0,
      durationSeconds: null,
      completedModules: partner.training?.completedModules ?? [],
      lastQuizScore: partner.training?.lastQuizScore ?? null,
      certificateStatus: 'issued',
    };
  }

  const currentModuleId = currentModuleIdOf(partner);
  const idx = moduleIndexOf(currentModuleId);
  const current = TRAINING_MODULES[idx];

  return {
    moduleId: current?.moduleId ?? null,
    moduleLabel: current?.label ?? null,
    // 1-based, matching the frontend's "Module X of Y" wording.
    moduleIndex: idx >= 0 ? idx + 1 : null,
    totalModules: TRAINING_MODULES.length,
    watchedSeconds: partner.training?.watchedSeconds ?? 0,
    durationSeconds: current?.durationSeconds ?? null,
    completedModules: partner.training?.completedModules ?? [],
    lastQuizScore: partner.training?.lastQuizScore ?? null,
    certificateStatus: partner.training?.certificateStatus ?? 'pending',
  };
};

export const updateProgress = async (partner, { moduleId, watchedSeconds }) => {
  if (isTrainingComplete(partner)) {
    throw new ApiError(400, 'TRAINING_COMPLETE', 'Training is already complete');
  }

  const currentModuleId = currentModuleIdOf(partner);
  if (moduleId !== currentModuleId) {
    throw new ApiError(
      400,
      'INVALID_MODULE',
      `You are currently on module '${currentModuleId}', not '${moduleId}'`
    );
  }

  const module = TRAINING_MODULES[moduleIndexOf(moduleId)];
  partner.training.currentModuleId = currentModuleId;
  // Monotonic and capped at the module's real duration — never let a stale/out-of-order request
  // rewind progress or overshoot what TrainingModule.jsx's own playback simulation could produce.
  partner.training.watchedSeconds = Math.min(
    module.durationSeconds,
    Math.max(partner.training.watchedSeconds ?? 0, watchedSeconds)
  );
  await partner.save();

  return getTrainingStatus(partner);
};

export const completeModule = async (partner, { moduleId, quizScore }) => {
  if (isTrainingComplete(partner)) {
    throw new ApiError(400, 'TRAINING_COMPLETE', 'Training is already complete');
  }

  const currentModuleId = currentModuleIdOf(partner);
  if (moduleId !== currentModuleId) {
    throw new ApiError(
      400,
      'INVALID_MODULE',
      `You are currently on module '${currentModuleId}', not '${moduleId}'`
    );
  }

  const idx = moduleIndexOf(moduleId);
  const module = TRAINING_MODULES[idx];
  // Mirrors TrainingModule.jsx's own UI gate (the "Continue to results" button stays disabled
  // until watchedSeconds >= durationSeconds) — enforced here too rather than trusting the client.
  if ((partner.training.watchedSeconds ?? 0) < module.durationSeconds) {
    throw new ApiError(400, 'MODULE_NOT_WATCHED', 'Finish watching this module before completing it');
  }

  partner.training.completedModules.push({ moduleId, quizScore, completedAt: new Date() });
  partner.training.lastQuizScore = quizScore;

  const nextModule = TRAINING_MODULES[idx + 1];
  if (nextModule) {
    partner.training.currentModuleId = nextModule.moduleId;
    partner.training.watchedSeconds = 0;
  } else {
    partner.training.currentModuleId = null;
    partner.training.certificateStatus = 'issued';
  }

  await partner.save();
  return getTrainingStatus(partner);
};
