export interface LoginForm {
  username: string;
  password: string;
}

export interface RegForm extends LoginForm {
  code: string;
  email: string;
}

export const MailCodeType = ['reg', 'changeEmail', 'changePwd', 'universal'];
export const MailLinkType = ['resetPwd'];
