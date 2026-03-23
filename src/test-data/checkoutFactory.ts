import { faker } from '@faker-js/faker';

import type { CheckoutFormData } from '../test-context/scenarioContext';

export class CheckoutFactory {
  static create(overrides?: Partial<CheckoutFormData>): CheckoutFormData {
    const zip = faker.location.zipCode('#####');

    return {
      firstName: 'Test',
      lastName: faker.person.lastName(),
      zip,
      ...overrides,
    };
  }
}
