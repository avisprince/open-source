import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

import { CanvasInfo, NamespaceItem, NamespaceItemId } from '#src/mongo/models';
import { MockEndpointBase } from '#src/mongo/models/namespaceItemBase/mockEndpoint.base';

@ObjectType({ implements: () => [MockEndpointBase, NamespaceItem] })
export class MockEndpoint extends MockEndpointBase implements NamespaceItem {
  @Field(() => Boolean)
  isTemplate?: boolean = false;

  @Field(() => String)
  @Prop()
  itemId: NamespaceItemId;

  @Field(() => CanvasInfo)
  @Prop({ type: Object })
  canvasInfo: CanvasInfo;

  @Field(() => [String], { defaultValue: [], nullable: true })
  @Prop()
  errors?: string[] = [];

  static validate(mockEndpoint: MockEndpoint): string[] {
    const errors: string[] = [];

    if (mockEndpoint.responseHeaders) {
      try {
        JSON.parse(mockEndpoint.responseHeaders);
      } catch (err) {
        errors.push('INVALID_RESPONSE_HEADERS');
      }
    }

    if (mockEndpoint.responseBody) {
      try {
        JSON.parse(mockEndpoint.responseBody);
      } catch (err) {
        errors.push('INVALID_RESPONSE_BODY');
      }
    }

    return errors;
  }
}
