import { Field, InterfaceType } from '@nestjs/graphql';

import { Action, QueryLog } from '#src/mongo/models';

export type NamespaceTrafficType = 'Action' | 'Query';

@InterfaceType({
  resolveType(traffic: NamespaceTraffic) {
    return traffic.trafficType === 'Query' ? QueryLog : Action;
  },
})
export abstract class NamespaceTraffic {
  @Field()
  trafficType: NamespaceTrafficType;
}
