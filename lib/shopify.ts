import ky from 'ky'

// Accept legacy alias SHOPIFY_SHOP_DOMAIN as a fallback
const domain = process.env.SHOPIFY_DOMAIN || process.env.SHOPIFY_SHOP_DOMAIN
const token = process.env.SHOPIFY_STOREFRONT_TOKEN

export async function storefront<T>(query: string, variables?: Record<string, unknown>) {
  const res = await ky.post(`https://${domain}/api/2024-07/graphql.json`, {
    headers: {
      'X-Shopify-Storefront-Access-Token': String(token),
      'Content-Type': 'application/json'
    },
    json: { query, variables }
  }).json<T>()
  return res
}
