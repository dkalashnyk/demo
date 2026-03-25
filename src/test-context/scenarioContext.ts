export class ScenarioContext {
  private data: Map<string, unknown> = new Map();

  set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  require<T>(key: string): T {
    const value = this.data.get(key);
    if (value === undefined) {
      throw new Error(`ScenarioContext: missing required key "${key}"`);
    }
    return value as T;
  }
}
