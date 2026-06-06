import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = 'ISO-8601 date-time string';

  parseValue(value: string): Date {
    return new Date(value);
  }

  serialize(value: Date): string {
    return value instanceof Date ? value.toISOString() : value;
  }

  parseLiteral(ast: ValueNode): Date | null {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
}
