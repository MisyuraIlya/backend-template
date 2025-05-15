export enum UsersTypes {
    USER = 'ROLE_USER',
    AGENT = 'ROLE_AGENT',
    ADMIN = 'ROLE_ADMIN',
    SUPER_AGENT = 'ROLE_SUPER_AGENT',
  }
  
  export function getRoles(userType: UsersTypes): string[] {
    switch (userType) {
      case UsersTypes.USER:
        return ['ROLE_USER'];
      case UsersTypes.AGENT:
        return ['ROLE_AGENT'];
      case UsersTypes.ADMIN:
        return ['ROLE_ADMIN'];
      case UsersTypes.SUPER_AGENT:
        return ['ROLE_SUPER_AGENT'];
      default:
        return [];
    }
  }
  