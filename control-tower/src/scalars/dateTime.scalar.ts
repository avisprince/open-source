import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = 'DateTime custom scalar type';

  // value from the client input variables
  parseValue(value: string): Date {
    return new Date(value);
  }

  // value sent to the client
  serialize(value: Date): string {
    return value instanceof Date ? value.toISOString() : value;
  }

  // value from the client query
  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
}
