export interface ISendMail {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html: string;
}

export interface ISendMailRes {
  etag: string;
  status: string;
}
