import { Request, Response } from 'express';

import { User } from '#src/mongo/models';

type Ctx = {
  req: Request & { user?: User };
  res: Response;
};

export default Ctx;
