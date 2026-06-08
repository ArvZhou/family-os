import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string, Date> {
  description = 'ISO-8601 date string (YYYY-MM-DD)';

  parseValue(value: unknown): Date {
    if (typeof value !== 'string') {
      throw new TypeError('Date scalar must be a string');
    }

    return new Date(value);
  }

  serialize(value: unknown): string {
    if (!(value instanceof Date)) {
      throw new TypeError('Date scalar must be a Date instance');
    }

    return value.toISOString().split('T')[0];
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }

    throw new TypeError('Date scalar literal must be a string');
  }
}
