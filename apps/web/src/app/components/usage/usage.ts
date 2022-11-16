export interface Usage {
  param: string;
  description: string;
  type: string;
  default?: string;
}

export interface Method {
  property: string;
  description: string;
  params: string;
  return?: string;
}
