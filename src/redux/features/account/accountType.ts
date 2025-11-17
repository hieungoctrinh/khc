export type accountLoginRequest = {
  email: string
  password: string
}

export type accountResisterRequest = {
  familyName: string
  firstName: string
  email: string
  password: string
  phoneNumber: string
}

export type DeleteAccountResponse = {
  message?: string;
  status?: string;
  data?: any;
};

export type registerDomainRequest = {
  club_name: string;
  domain: string;
  passcode: string;
};