import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { SORT } from '@shared/enums';

@ValidatorConstraint()
export class SortFieldsValidatorConstraint
  implements ValidatorConstraintInterface
{
  ALLOW_ENUM = [SORT.ASC, SORT.DESC];
  failedPropNames: string[] = [];

  public validate(propValue: any): boolean {
    this.failedPropNames = []; // * Clean prev state
    for (const key in propValue) {
      if (!this.ALLOW_ENUM.includes(propValue[key])) {
        this.failedPropNames.push(key);
      }
    }
    return this.failedPropNames.length === 0;
  }

  public defaultMessage(): string {
    return `Sort Fields : { ${this.failedPropNames.join(
      ',',
    )} } must be either ${SORT.ASC} or ${SORT.DESC}`;
  }
}
