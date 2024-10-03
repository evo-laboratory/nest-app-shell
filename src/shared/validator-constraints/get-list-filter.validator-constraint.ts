import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class GetListFiltersValidatorConstraint
  implements ValidatorConstraintInterface
{
  ALLOW_TYPES = ['string', 'boolean'];
  failedPropNames: string[] = [];

  public validate(propValue: any): boolean {
    this.failedPropNames = []; // * Clean prev state
    for (const key in propValue) {
      // * Check if is Array
      if (Array.isArray(propValue[key])) {
        // * Array must be all String
        const isValid = propValue[key].every(
          (value) => typeof value === 'string',
        );
        if (!isValid) {
          this.failedPropNames.push(key);
        }
      } else if (!this.ALLOW_TYPES.includes(typeof propValue[key])) {
        this.failedPropNames.push(key);
      }
    }
    return this.failedPropNames.length === 0;
  }

  public defaultMessage(): string {
    return `Filter Fields : { ${this.failedPropNames.join(
      ',',
    )} } must be either boolean, string or string[] (ENUM)`;
  }
}
