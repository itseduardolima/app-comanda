import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedOperator } from '../../common/types/authenticated-operator';

/** Extracts the authenticated operator (set by the JWT strategy) from the request. */
export const CurrentOperator = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedOperator => {
    const request = context.switchToHttp().getRequest<{ user: AuthenticatedOperator }>();
    return request.user;
  },
);
