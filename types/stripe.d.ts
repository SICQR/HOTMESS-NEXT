declare module 'stripe' {
  export interface Event { id: string; type: string }
  export default class Stripe {
    constructor(key: string, opts?: Record<string, unknown>)
    webhooks: { constructEvent(raw: string, sig: string, secret: string): Event }
  }
}