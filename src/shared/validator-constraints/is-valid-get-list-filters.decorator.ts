import { registerDecorator, ValidationOptions } from 'class-validator';
import { GetListFiltersValidatorConstraint } from './get-list-filter.validator-constraint';

export function IsValidGetListFilters(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: GetListFiltersValidatorConstraint,
    });
  };
}
