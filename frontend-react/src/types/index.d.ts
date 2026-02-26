// common interfaces used throughout the application

export interface Cliente {
  id: number;
  cliente: string;
  fantasia?: string;
  email?: string;
  // add further properties as the API evolves
}
