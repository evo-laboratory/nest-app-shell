export interface ISendMail {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html: string;
}

export interface ISendMailRes {
  mailId: string;
  statusText: string;
}
