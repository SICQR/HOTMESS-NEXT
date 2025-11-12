
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import { logger } from '@/lib/log';

interface Seller {
  id: string;
  name: string;
  shop_name: string;
  email: string;
  product_category: string;
  product_description: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
}

export default function SellerPage() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params.sellerId as string;
  
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const statusRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (sellerId) {
      fetchSellerData(sellerId);
    }
  }, [sellerId]);

  const fetchSellerData = async (id: string) => {
    try {
      setLoading(true);
      
      // TODO: Create API endpoints to fetch seller and their products
      // For now, simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock seller data
      const mockSellers = {
        '1': {
          id: '1',
          name: 'Alex Johnson',
          shop_name: 'Bold Designs Co',
          email: 'alex@bolddesigns.co',
          product_category: 'apparel',
          product_description: 'Edgy streetwear with bold graphics and premium materials. We believe in self-expression through fashion.',
          created_at: new Date().toISOString(),
        },
        '2': {
          id: '2',
          name: 'Sam Rodriguez',
          shop_name: 'Rebel Accessories',
          email: 'sam@rebelaccessories.com',
          product_category: 'accessories',
          product_description: 'Unique jewelry and accessories for the modern rebel. Each piece tells a story.',
          created_at: new Date().toISOString(),
        },
        '3': {
          id: '3',
          name: 'Jordan Kim',
          shop_name: 'Care & Chaos',
          email: 'jordan@careandchaos.com',
          product_category: 'self-care',
          product_description: 'Self-care products that embrace your wild side. Wellness meets rebellion.',
          created_at: new Date().toISOString(),
        },
      };

      const mockProducts: { [key: string]: Product[] } = {
        '1': [
          { id: 'p1', name: 'Neon Thunder Tee', description: 'Bold graphic tee with lightning design', price: 29.99, category: 'apparel' },
          { id: 'p2', name: 'Rebel Rose Hoodie', description: 'Cozy hoodie with rose graphic', price: 59.99, category: 'apparel' },
          { id: 'p3', name: 'Street Warrior Tank', description: 'Distressed tank top', price: 24.99, category: 'apparel' },
        ],
        '2': [
          { id: 'p4', name: 'Spike Chain Necklace', description: 'Edgy chain with spike details', price: 34.99, category: 'accessories' },
          { id: 'p5', name: 'Rebel Ring Set', description: 'Set of 3 statement rings', price: 19.99, category: 'accessories' },
          { id: 'p6', name: 'Thunder Earrings', description: 'Lightning bolt drop earrings', price: 24.99, category: 'accessories' },
        ],
        '3': [
          { id: 'p7', name: 'Chaos Bath Bomb', description: 'Color-changing bath bomb', price: 12.99, category: 'self-care' },
          { id: 'p8', name: 'Rebel Balm', description: 'Tattoo aftercare balm', price: 16.99, category: 'self-care' },
          { id: 'p9', name: 'Wild Hair Serum', description: 'Volumizing hair serum', price: 22.99, category: 'self-care' },
        ],
      };

      const sellerData = mockSellers[id as keyof typeof mockSellers];
      const sellerProducts = mockProducts[id] || [];

      if (!sellerData) {
        setError('Seller not found');
        return;
      }

      setSeller(sellerData);
      setProducts(sellerProducts);
    } catch (error) {
      logger.error('Failed to fetch seller data', { error, sellerId: id });
      setError('Failed to load seller information');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'apparel': return '#FF0080';
      case 'accessories': return '#7400b8';
      case 'self-care': return '#ff6b35';
      default: return '#00d9ff';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0D0D0D', 
        color: '#FFF', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p aria-live="polite" style={{ fontSize: '1.2rem' }}>Loading seller...</p>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0D0D0D', 
        color: '#FFF', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <p
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          style={{ fontSize: '1.2rem', color: '#ff6b6b', margin: 0 }}
        >
          {error || 'Seller not found'}
        </p>
        <Button text="← Back to Marketplace" onClick={() => router.push('/marketplace')} />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0D0D0D', 
      color: '#FFF', 
      padding: '20px' 
    }}>
      <main aria-labelledby="seller-heading" role="main">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '3rem' }}>
          <Link 
            href="/marketplace"
            style={{ 
              color: getCategoryColor(seller.product_category),
              textDecoration: 'none',
              fontSize: '1rem',
              marginBottom: '1rem',
              display: 'inline-block'
            }}
            aria-label="Back to marketplace"
          >
            ← Back to Marketplace
          </Link>
          
          <div style={{
            background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
            borderRadius: '16px',
            padding: '2rem',
            border: `2px solid ${getCategoryColor(seller.product_category)}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${getCategoryColor(seller.product_category)}, #7400b8)`
            }} />
            
            <h1
              id="seller-heading"
              ref={headingRef}
              tabIndex={-1}
              style={{ 
              fontSize: '2.5rem', 
              color: getCategoryColor(seller.product_category),
              marginBottom: '0.5rem'
            }}
            >
              {seller.shop_name}
            </h1>
            
            <p style={{ 
              fontSize: '1.1rem', 
              opacity: 0.7, 
              marginBottom: '1rem'
            }}>
              by {seller.name}
            </p>

            <p style={{ 
              lineHeight: '1.6',
              fontSize: '1rem',
              marginBottom: '1.5rem',
              maxWidth: '800px'
            }}>
              {seller.product_description}
            </p>

            <span style={{
              background: getCategoryColor(seller.product_category),
              color: 'white',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              textTransform: 'capitalize',
              fontWeight: 'bold'
            }}>
              {seller.product_category}
            </span>
          </div>
        </header>

        {/* Products */}
        <section aria-labelledby="products-heading">
          <h2 id="products-heading" style={{ 
            fontSize: '2rem', 
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Products
          </h2>

          {products.length > 0 ? (
            <ul
              role="list"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
                padding: 0,
                listStyle: 'none'
              }}
            >
              {products.map((product) => (
                <li key={product.id}>
                  <div 
                    style={{
                      background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '1px solid #333',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = getCategoryColor(seller.product_category);
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#333';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <h3 style={{ 
                      color: getCategoryColor(seller.product_category),
                      marginBottom: '0.5rem',
                      fontSize: '1.2rem'
                    }}>
                      {product.name}
                    </h3>
                    
                    <p style={{ 
                      opacity: 0.8,
                      marginBottom: '1rem',
                      lineHeight: '1.4'
                    }}>
                      {product.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        color: getCategoryColor(seller.product_category)
                      }}>
                        ${product.price}
                      </span>
                      
                      <button
                        aria-label={`Add ${product.name} to cart for $${product.price}`}
                        style={{
                          background: getCategoryColor(seller.product_category),
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        onClick={() => {
                          // TODO: Implement add to cart functionality
                          alert(`Added ${product.name} to cart!`);
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: '#1a1a1a',
              borderRadius: '12px',
              border: '2px dashed #333'
            }}>
              <h3 style={{ marginBottom: '1rem', opacity: 0.7 }}>No products yet</h3>
              <p aria-live="polite" style={{ opacity: 0.6 }}>
                This seller is still setting up their shop.
              </p>
            </div>
          )}
        </section>

        {/* Contact Info */}
        <section aria-labelledby="contact-heading" style={{
          marginTop: '3rem',
          padding: '2rem',
          background: '#1a1a1a',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 id="contact-heading" style={{ marginBottom: '1rem' }}>Get in Touch</h3>
          <p style={{ opacity: 0.8, marginBottom: '1rem' }}>
            Want to collaborate or have questions about products?
          </p>
          <Button 
            text={`Contact ${seller.name}`}
            onClick={() => {
              // TODO: Implement contact functionality
              window.location.href = `mailto:${seller.email}?subject=Inquiry about ${seller.shop_name}`;
            }}
          />
        </section>
        </div>
      </main>
    </div>
  );
}