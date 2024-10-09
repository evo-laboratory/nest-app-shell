import { getSchemaPath } from '@nestjs/swagger';

export function MongoObjectIdDtoRef(refDto: any) {
  return [
    { $ref: getSchemaPath(refDto) },
    { type: 'string' },
    { type: 'null' },
  ];
}
