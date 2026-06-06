import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string, Date | null> {
  description = 'ISO-8601 date string (YYYY-MM-DD)';

  parseValue(value: string): Date {
    return new Date(value);
  }

  serialize(value: Date): string {
    return value instanceof Date ? value.toISOString().split('T')[0] : value;
  }

  parseLiteral(ast: ValueNode): Date | null {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
}
