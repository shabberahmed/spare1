export interface IOrganization {
  organizationName: string;
  organizationType: OrganizationType;
  emailDomain?: string;
}
export enum OrganizationType {
  Hospitals = 'Hospitals',
  Hospitality = 'Hospitality',
  PlayArea = 'PlayArea',
  Hotels = 'Hotels',
}

export enum  OrganizationUserRoles {
  HospitalsAdmin = 'HospitalsAdmin',
  HotelsAdmin = 'HotelsAdmin',
  HospitalityAdmin = 'HospitalityAdmin',
  PlayAreaAdmin = 'PlayAreaAdmin',
  HospitalsManager = 'HospitalsManager',
  HotelsManager = 'HotelsManager',
  HospitalityManager = 'HospitalityManager',
  PlayAreaManager = 'PlayAreaManager',
  HospitalityGroundStaff = 'HospitalityManagerGroundStaff',
}
