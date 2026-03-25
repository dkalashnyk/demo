import { faker } from '@faker-js/faker';

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  zip: string;
}

export class CheckoutFactory {
  private data: CheckoutFormData = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    zip: faker.location.zipCode('#####'),
  };

  withFirstName(firstName: string): this {
    this.data.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): this {
    this.data.lastName = lastName;
    return this;
  }

  withZip(zip: string): this {
    this.data.zip = zip;
    return this;
  }

  build(): CheckoutFormData {
    return { ...this.data };
  }

  static create(overrides?: Partial<CheckoutFormData>): CheckoutFormData {
    const factory = new CheckoutFactory();
    if (overrides?.firstName) factory.withFirstName(overrides.firstName);
    if (overrides?.lastName) factory.withLastName(overrides.lastName);
    if (overrides?.zip) factory.withZip(overrides.zip);
    return factory.build();
  }
}
