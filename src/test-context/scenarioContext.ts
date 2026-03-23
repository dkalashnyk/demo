export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  zip: string;
}

export type ScenarioData = {
  checkout?: CheckoutFormData;
};

export class ScenarioContext {
  private data: ScenarioData = {};

  set<K extends keyof ScenarioData>(key: K, value: ScenarioData[K]) {
    this.data[key] = value;
  }

  get<K extends keyof ScenarioData>(key: K): ScenarioData[K] {
    return this.data[key];
  }

  require<K extends keyof ScenarioData>(key: K): NonNullable<ScenarioData[K]> {
    const value = this.data[key];
    if (!value) throw new Error(`ScenarioContext: missing required key "${String(key)}"`);
    return value as NonNullable<ScenarioData[K]>;
  }
}
