import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * SSO Guard for OAuth2/OIDC authentication.
 * Reserved — will be implemented when SSO is enabled.
 */
@Injectable()
export class SsoGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // TODO: Verify SSO token or redirect to SSO provider
    return true;
  }
}
