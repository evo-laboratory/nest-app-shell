import { registerDecorator, ValidationOptions } from 'class-validator';
import { SortFieldsValidatorConstraint } from './sort-fields.validator-constraint';

export function IsValidSortFields(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: SortFieldsValidatorConstraint,
    });
  };
}
