import { getJwtSignOptions } from './auth.module';

describe('getJwtSignOptions', () => {
  it('configures the token lifetime from JWT_EXPIRES_IN', () => {
    expect(getJwtSignOptions({ JWT_EXPIRES_IN: '1h' })).toEqual({
      expiresIn: '1h',
    });
  });

  it('leaves tokens without an expiration when JWT_EXPIRES_IN is unset or blank', () => {
    expect(getJwtSignOptions({})).toEqual({});
    expect(getJwtSignOptions({ JWT_EXPIRES_IN: '  ' })).toEqual({});
  });
});
