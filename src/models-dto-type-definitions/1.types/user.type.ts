// otp-notification.interface.ts
export interface OTPNotification {
  NotificationID: number;
  UserID: number;
  OTP: string;
  GeneratedAt: Date;
  ExpiresAt: Date;
  Status: string;
  SuperAdminID: number;
}

// user.interface.ts
export interface Users {
  id?: any;
  _id?: any;
  email?: string;
  phoneNumber: string;
  roles?: Array<string>;
  isSuperAdmin: boolean;
  name?: string;
  organizationId?: any;
  isOrganizationUser: boolean;
  servicesUsed: string[];
  userBioStatus: IUserBioStatus;
}

// role.interface.ts
export interface Role {
  id: number;
  role_name: string;
  description: string;
  responsibilities: string;
  permissions: any;
  status: string;
  default_role: boolean;
  role_type: string;
}

// super-admin-join-request.interface.ts
export interface SuperAdminJoinRequest {
  request_id: number;
  super_admin_id: number;
  admin_id: number;
  admin_type: string;
  status: string;
}

// team.interface.ts
export interface Team {
  team_id: number;
  name: string;
  status: string;
}

// team-member.interface.ts
export interface TeamMember {
  team_member_id: number;
  team_id: number;
  member_id: number;
  join_date: Date;
}

// main-user.interface.ts
export interface MainUser {
  id: number;
  user_id: number;
  user_type: string;
  service_id: number;
}

// task.interface.ts
export interface Task {
  id: number;
  tenant_id: number;
  main_user_id: number;
  title: string;
  description: string;
  status: string;
  assigned_to: number;
  approval_status: string;
  payment_amount: number;
  created_at: Date;
  updated_at: Date;
  task_type: string;
  amount_to_be_paid: number;
  amount_paid_status: string;
  amount_expected_from: string;
  amount_to_be_disbursed_to: string;
  pickup_date: Date;
  pickup_time: Date;
  pickup_location: string;
  drop_location: string;
  verified_by_main_user: boolean;
}

export interface IUser {
  name: string;
  mobile: string;
  roles: string[];
  organizationId?: string;
  isOrganizationUser: boolean;
  servicesUsed: string[];
}
export enum EmailStatus {
  NotAdded = 'NotAdded',
  Added = 'Added',
  NotVerified = 'NotVerified',
  Verified = 'Verified',
}

export enum UserFullNameStatus {
  NotAdded = 'NotAdded',
  Added = 'Added',
}

export interface IUserBioStatus {
  emailStatus: EmailStatus;
  nameStatus: UserFullNameStatus;
  idCardUploaded: boolean;
}
export enum IDType {
  PASSPORT = 'passport',
  AADHAAR = 'aadhaar',
  VOTERID = 'voterid',
}