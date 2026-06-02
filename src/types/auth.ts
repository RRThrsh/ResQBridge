export interface AuthProfile {
  email: string
  firstName: string
  lastName: string
}

export interface AuthUser extends AuthProfile {
  role: 'user'
}

export interface AdminUser extends AuthProfile {
  role: 'admin'
}

export interface RescuerUser extends AuthProfile {
  role: 'rescuer'
}
