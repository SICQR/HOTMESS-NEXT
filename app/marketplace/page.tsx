
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/log';

interface Seller {
  id: string;
  name: string;
  shop_name: string;
  product_category: string;
  product_description: string;
  created_at: string;
}

export default function MarketplacePage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const statusRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      // TODO: Create an API endpoint to fetch approved sellers
      // For now, we'll simulate some data
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for now
      const mockSellers: Seller[] = [
        {
          id: '1',
          name: 'Alex Johnson',
          shop_name: 'Bold Designs Co',
          product_category: 'apparel',
          product_description: 'Edgy streetwear with bold graphics and premium materials',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Sam Rodriguez',
          shop_name: 'Rebel Accessories',
          product_category: 'accessories',
          product_description: 'Unique jewelry and accessories for the modern rebel',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Jordan Kim',
          shop_name: 'Care & Chaos',
          product_category: 'self-care',
          product_description: 'Self-care products that embrace your wild side',
          created_at: new Date().toISOString(),
        },
      ];

      setSellers(mockSellers);
    } catch (error) {
      logger.error('Failed to fetch sellers', { error });
      setError('Failed to load sellers');
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

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'apparel': return '👕';
      case 'accessories': return '💎';
      case 'self-care': return '🌸';
      default: return '🛍️';
    }
  };

  useEffect(() => {
    // Announce error state politely
    if (error && statusRef.current) {
      statusRef.current.focus();
    }
  }, [error]);

  useEffect(() => {
    // After first successful load, move focus to the page heading
    if (!loading && !error && headingRef.current) {
      headingRef.current.focus();
    }
  }, [loading, error]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0D0D0D', 
      color: '#FFF', 
      padding: '20px' 
    }}>
      <main aria-labelledby="marketplace-heading" aria-busy={loading} role="main">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1
              id="marketplace-heading"
              ref={headingRef}
              tabIndex={-1}
              style={{ 
                fontSize: '3rem', 
                background: 'linear-gradient(135deg, #FF0080, #7400b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1rem'
              }}
            >
              HOTMESS Marketplace
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
              Discover bold creators and their unique products
            </p>
          </header>

          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p aria-live="polite" style={{ fontSize: '1.2rem' }}>Loading sellers...</p>
            </div>
          )}

          {error && (
            <div style={{
              padding: '20px',
              backgroundColor: '#2a0f10',
              border: '1px solid #7a1a1a',
              borderRadius: '8px',
              color: '#ffb4b4',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <p
                ref={statusRef}
                tabIndex={-1}
                role="alert"
                aria-live="assertive"
                style={{ margin: 0 }}
              >
                {error}
              </p>
            </div>
          )}

          {!loading && !error && (
            <section aria-labelledby="sellers-heading">
              <h2 id="sellers-heading" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
                Sellers
              </h2>
              <ul
                role="list"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '2rem',
                  marginBottom: '3rem',
                  padding: 0,
                  listStyle: 'none'
                }}
              >
                {sellers.map((seller) => (
                  <li key={seller.id}>
                    <Link 
                      href={`/marketplace/${seller.id}`}
                      aria-label={`View shop ${seller.shop_name} by ${seller.name}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div style={{
                        background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                        borderRadius: '12px',
                        padding: '24px',
                        border: '1px solid #333',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.borderColor = getCategoryColor(seller.product_category);
                        e.currentTarget.style.boxShadow = `0 10px 25px rgba(${seller.product_category === 'apparel' ? '255, 0, 128' : seller.product_category === 'accessories' ? '116, 0, 184' : '255, 107, 53'}, 0.2)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = '#333';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          fontSize: '2rem'
                        }}>
                          {getCategoryEmoji(seller.product_category)}
                        </div>

                        <h3 style={{ 
                          color: getCategoryColor(seller.product_category),
                          marginBottom: '0.5rem',
                          fontSize: '1.4rem'
                        }}>
                          {seller.shop_name}
                        </h3>
                        
                        <p style={{ 
                          opacity: 0.7, 
                          marginBottom: '1rem',
                          fontSize: '0.9rem'
                        }}>
                          by {seller.name}
                        </p>

                        <p style={{ 
                          lineHeight: '1.5',
                          marginBottom: '1rem',
                          color: '#e0e0e0'
                        }}>
                          {seller.product_description}
                        </p>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '1.5rem'
                        }}>
                          <span style={{
                            background: getCategoryColor(seller.product_category),
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            textTransform: 'capitalize'
                          }}>
                            {seller.product_category}
                          </span>
                          
                          <span style={{
                            color: getCategoryColor(seller.product_category),
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}>
                            View Shop →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {sellers.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  background: '#1a1a1a',
                  borderRadius: '12px',
                  border: '2px dashed #333'
                }}>
                  <h3 style={{ marginBottom: '1rem', opacity: 0.7 }}>No sellers yet</h3>
                  <p aria-live="polite" style={{ opacity: 0.6 }}>
                    Be the first to join our marketplace!
                  </p>
                  <Link 
                    href="/onboarding/seller"
                    style={{
                      display: 'inline-block',
                      marginTop: '1rem',
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #FF0080, #7400b8)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold'
                    }}
                  >
                    Become a Seller
                  </Link>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}