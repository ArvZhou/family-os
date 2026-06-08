import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = 'ISO-8601 date-time string';

  parseValue(value: unknown): Date {
    if (typeof value !== 'string') {
      throw new TypeError('DateTime scalar must be a string');
    }

    return new Date(value);
  }

  serialize(value: unknown): string {
    if (!(value instanceof Date)) {
      throw new TypeError('DateTime scalar must be a Date instance');
    }

    return value.toISOString();
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }

    throw new TypeError('DateTime scalar literal must be a string');
  }
}
