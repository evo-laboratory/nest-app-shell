// * Application Shell Default File
import { customAlphabet, nanoid } from 'nanoid';

export function EnumToArray(enumObject: object): string[] {
  if (typeof enumObject !== 'object') {
    console.error(
      `[ HELPER ][ EnumsToList ] Input is not an valid Enum Object.`,
    );
    return [];
  }
  const result = Object.keys(enumObject).map((property: string) => {
    return enumObject[property];
  });
  return result;
}

export function ExtractObjectId(target: any) {
  if (typeof target === 'string') {
    return target;
  } else if (typeof target === 'object' && target._id) {
    return target._id;
  } else {
    throw new Error(
      `[ HELPER ] [ ExtractObjectId ] Cannot ExtractObjectId from target ( ${typeof target})`,
    );
  }
}

export function RandomCode(strRange: string, count: number) {
  const code = customAlphabet(strRange, count);
  return code();
}

export function RandomNumber(count = 6) {
  return RandomCode('12345678910', count);
}

export function PromisedTimeout(second: number) {
  return new Promise((resolve) => setTimeout(resolve, second * 1000));
}

export function ExtractPropertiesFromObj<T>(
  oriObj: object,
  properties: string[],
): T {
  return properties.reduce((result, prop) => {
    if (oriObj[`${prop}`]) {
      result[`${prop}`] = oriObj[`${prop}`];
    }
    return result;
  }, {} as T);
}

export function CheckTwoArrayHasCommon(fstArr: any[], sndArr: any[]): boolean {
  return fstArr.some((item) => sndArr.includes(item));
}

export function ParseAnyToBoolean(input: any): boolean {
  const inputText = `${input}`.toUpperCase();
  const TRUE_VARIANTS = ['TRUE', 'T'];
  const FALSE_VARIANTS = ['FALSE', 'F'];
  if (TRUE_VARIANTS.includes(inputText)) {
    return true;
  } else if (FALSE_VARIANTS.includes(inputText)) {
    return false;
  } else {
    return false;
  }
}

export function ParseQueryStrToTypedList<T>(input: any): T[] {
  if (typeof input === 'string') {
    return input.split(',') as T[];
  } else {
    return [];
  }
}

export function MinToMilliseconds(min: number | string) {
  const converted = Number(min);
  if (typeof converted !== 'number') {
    console.error(
      `[ HELPER ][ MinToMilliseconds ] Input is not an valid number, returns 0 instead`,
    );
    return 0;
  }
  return converted * 60000;
}

export type PickEnum<T, K extends T> = {
  [P in keyof K]: P extends K ? P : never;
};

export function GenerateUUID(): string {
  return nanoid();
}

export function PathToPermissionIdPath(path: string): string {
  let converted = path;
  if (path.charAt(0) === '/') {
    converted = path.substring(1);
  }
  return converted.toUpperCase().replace(/\//g, ':');
}

export function JsonStringify(object: any, space = 2) {
  if (typeof object === 'object' && object !== null) {
    return JSON.stringify(object, null, space);
  } else {
    return `${object}`;
  }
}
