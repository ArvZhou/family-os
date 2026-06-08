import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('JSON')
export class JsonScalar implements CustomScalar<string, Record<string, unknown>> {
  description = 'Arbitrary JSON value';

  parseValue(value: unknown): Record<string, unknown> {
    if (typeof value !== 'string') {
      throw new TypeError('JSON scalar must be a string');
    }

    return JSON.parse(value) as Record<string, unknown>;
  }

  serialize(value: unknown): string {
    if (typeof value !== 'object' || value === null) {
      throw new TypeError('JSON scalar must be an object');
    }

    return JSON.stringify(value);
  }

  parseLiteral(ast: ValueNode): Record<string, unknown> {
    if (ast.kind === Kind.STRING) {
      return JSON.parse(ast.value) as Record<string, unknown>;
    }

    throw new TypeError('JSON scalar literal must be a string');
  }
}
