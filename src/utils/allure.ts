import { test } from '@playwright/test';

export default {
  epic: (value: string) => test.info().annotations.push({ type: 'epic', description: value }),

  feature: (value: string) => test.info().annotations.push({ type: 'feature', description: value }),

  story: (value: string) => test.info().annotations.push({ type: 'story', description: value }),

  severity: (value: string) =>
    test.info().annotations.push({ type: 'severity', description: value }),

  owner: (value: string) => test.info().annotations.push({ type: 'owner', description: value }),

  tag: (value: string) => test.info().annotations.push({ type: 'tag', description: value }),

  step: async <T>(name: string, body: () => Promise<T>) => await test.step(name, body),
};
