import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('JSON')
export class JsonScalar implements CustomScalar<string, Record<string, unknown>> {
  description = 'Arbitrary JSON value';

  parseValue(value: string): Record<string, unknown> {
    return JSON.parse(value);
  }

  serialize(value: Record<string, unknown>): string {
    return JSON.stringify(value);
  }

  parseLiteral(ast: ValueNode): Record<string, unknown> | null {
    if (ast.kind === Kind.STRING) {
      return JSON.parse(ast.value);
    }
    return null;
  }
}
