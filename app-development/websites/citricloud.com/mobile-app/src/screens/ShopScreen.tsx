import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator, useWindowDimensions, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { useColors } from '../theme/colors';
import { useCartStore } from '../store/cartStore';
import { shopAPI } from '../lib/api';

export default function ShopScreen({ navigation }: any) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const cartCount = useCartStore((s) => s.getItemCount());

  // Helper function to resolve image URLs to absolute URLs
  const resolveImageUrl = (rawUrl: string): string => {
    if (!rawUrl || !rawUrl.trim()) return '';

    const url = rawUrl.trim();
    
    // If already an absolute HTTPS URL, return as-is
    if (url.startsWith('https://')) {
      return url;
    }
    
    // If HTTP, convert to HTTPS
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    
    // If relative path, build full URL with citricloud.com
    if (url.startsWith('/')) {
      return `https://citricloud.com${url}`;
    }
    
    // Otherwise assume it's relative to uploads
    return `https://citricloud.com/uploads/${url}`;
  };

  // Helper function to safely get product image
  const getProductImage = (product: any): string | null => {
    // Try single image field first
    if (product.image && typeof product.image === 'string' && product.image.trim()) {
      return resolveImageUrl(product.image);
    }
    // Try images array
    if (Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string' && firstImage.trim()) {
        return resolveImageUrl(firstImage);
      }
    }
    return null;
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await shopAPI.getCategories();
      console.log('[SHOP] Loaded', data.length, 'categories');
      setCategories(data);
    } catch (error) {
      console.error('[SHOP] Failed to load categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await shopAPI.getProducts(selectedCategory);
      console.log('[SHOP] Raw API response:', response);
      const items = Array.isArray(response) ? response : (response?.items || []);
      console.log('[SHOP] Loaded', items.length, 'products');
      if (items.length > 0) {
        const firstProduct = items[0];
        console.log('[SHOP] First product full object:', firstProduct);
        console.log('[SHOP] First product image data:', {
          image: firstProduct.image,
          images: firstProduct.images,
          getProductImage: getProductImage(firstProduct),
        });
      }
      setProducts(items);
    } catch (error) {
      console.error('[SHOP] Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: any) => {
    navigation.navigate('ProductDetail', {
      productSlug: product.slug,
      productId: product.id
    });
  };

  const handlePurchase = (product: any) => {
    handleProductPress(product);
  };

  return (
    <Screen>
      <SectionHeader 
        title="Shop" 
        subtitle="Upgrade your workspace with premium plans"
        actionLabel={cartCount > 0 ? `View Cart (${cartCount})` : undefined}
        onAction={cartCount > 0 ? () => navigation.navigate('Cart') : undefined}
      />

      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder="Search products..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: colors.textPrimary }]}
        />
      </View>

      {/* View & Sort Controls */}
      <View style={styles.controlsRow}>
        <View style={styles.viewToggle}>
          <Pressable 
            onPress={() => setViewMode('grid')}
            style={[styles.viewButton, viewMode === 'grid' && { backgroundColor: colors.accent }]}
          >
            <Ionicons name="grid-outline" size={16} color={viewMode === 'grid' ? '#fff' : colors.textSecondary} />
          </Pressable>
          <Pressable 
            onPress={() => setViewMode('list')}
            style={[styles.viewButton, viewMode === 'list' && { backgroundColor: colors.accent }]}
          >
            <Ionicons name="list-outline" size={16} color={viewMode === 'list' ? '#fff' : colors.textSecondary} />
          </Pressable>
        </View>
        <Pressable style={[styles.sortButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="swap-vertical-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[styles.sortButtonText, { color: colors.textPrimary }]}>Sort</Text>
        </Pressable>
      </View>

      {/* Categories Filter */}
      {!categoriesLoading && categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <Pressable
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === null ? colors.accent : colors.surface,
                  borderColor: selectedCategory === null ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory === null ? '#fff' : colors.textPrimary },
                ]}
              >
                All
              </Text>
            </Pressable>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategory === category.id ? colors.accent : colors.surface,
                    borderColor: selectedCategory === category.id ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={14}
                  color={selectedCategory === category.id ? '#fff' : colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.categoryText,
                    { color: selectedCategory === category.id ? '#fff' : colors.textPrimary },
                  ]}
                >
                  {category.name}
                </Text>
                {category.product_count !== undefined && (
                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.3)' : colors.muted + '40',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBadgeText,
                        { color: selectedCategory === category.id ? '#fff' : colors.textSecondary },
                      ]}
                    >
                      {category.product_count}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : products.length > 0 ? (
        <View style={viewMode === 'list' ? undefined : (isTablet ? styles.gridContainer : undefined)}>
          {products
            .filter((product) => {
              const matchesSearch = !searchQuery.trim() || 
                product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase());
              return matchesSearch;
            })
            .sort((a, b) => {
              const priceA = Number(a.price || a.amount || 0);
              const priceB = Number(b.price || b.amount || 0);
              if (sortBy === 'price-low') return priceA - priceB;
              if (sortBy === 'price-high') return priceB - priceA;
              return 0;
            })
            .map((product, idx) => (
            <View key={product.id} style={viewMode === 'list' ? styles.listItemWrapper : (isTablet ? styles.gridItem : undefined)}>
              <Pressable 
                onPress={() => handleProductPress(product)}
                style={{ flex: 1 }}
              >
                <Card style={viewMode === 'list' ? [styles.productCard, styles.productCardList] : styles.productCard}>
            {/* Product Image - Grid Mode */}
            {viewMode === 'grid' && (
              <View style={[styles.productImageContainer, { backgroundColor: colors.accent + '15' }]}>
                {getProductImage(product) ? (
                  <Image
                    source={{ uri: getProductImage(product)! }}
                    style={styles.productImage}
                    resizeMode="cover"
                    onError={(error) => {
                      console.log('[SHOP] Image load error for product', product.id, ':', product.name);
                    }}
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="image-outline" size={64} color={colors.accent} />
                    <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                      Product Image
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={viewMode === 'list' ? styles.productHeaderList : styles.productHeader}>
              {viewMode === 'list' && getProductImage(product) ? (
                <View style={[styles.iconWrapper, { backgroundColor: colors.surface }]}>
                  <Image
                    source={{ uri: getProductImage(product)! }}
                    style={styles.productThumbnail}
                    resizeMode="cover"
                    onError={(error) => {
                      console.log('[SHOP] Thumbnail load error for product', product.id, ':', product.name);
                    }}
                  />
                </View>
              ) : viewMode === 'list' ? (
                <View style={[styles.iconWrapper, { backgroundColor: colors.surface }]}>
                  <Ionicons 
                    name={(product.icon || 'cube-outline') as any} 
                    size={28} 
                    color={colors.accent} 
                  />
                </View>
              ) : null}
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
                  {product.name || product.title}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: colors.accent }]}>
                    {product.price || product.amount}
                  </Text>
                  <Text style={[styles.currency, { color: colors.accent }]}>
                    {product.currency || 'USD'}
                  </Text>
                  {product.period && (
                    <Text style={[styles.period, { color: colors.textSecondary }]}>/{product.period}</Text>
                  )}
                  {product.billing_cycle && (
                    <Text style={[styles.period, { color: colors.textSecondary }]}>/{product.billing_cycle}</Text>
                  )}
                </View>
              </View>
            </View>
            
            {viewMode === 'grid' && product.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
                {product.description}
              </Text>
            )}

            {viewMode === 'grid' && (product.features || product.highlights) && (
              <View style={styles.features}>
                {(product.features || product.highlights).slice(0, 5).map((feature: any, idx: number) => (
                  <View key={idx} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
                    <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                      {typeof feature === 'string' ? feature : feature.name || feature.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {product.stock !== undefined && product.stock === 0 && (
              <View style={[styles.outOfStock, { backgroundColor: colors.muted + '20' }]}>
                <Text style={[styles.outOfStockText, { color: colors.muted }]}>Out of Stock</Text>
              </View>
            )}

            <Pressable 
              style={[
                viewMode === 'list' ? styles.buyButtonList : styles.buyButton,
                { 
                  backgroundColor: product.stock === 0 ? colors.muted : colors.accent,
                  opacity: product.stock === 0 ? 0.5 : 1
                }
              ]}
              onPress={() => handlePurchase(product)}
              disabled={product.stock === 0}
            >
              <Text style={[styles.buyButtonText, { color: colors.background }]}>
                {product.stock === 0 ? 'Unavailable' : 'Purchase'}
              </Text>
              <Ionicons name="cart" size={18} color={colors.background} />
            </Pressable>
              </Card>
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Card style={styles.productCard}>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            No products available yet.
          </Text>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 8,
  },
  productCard: {
    marginBottom: 16,
  },
  productCardList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
  },
  listItemWrapper: {
    paddingHorizontal: 0,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productHeaderList: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginBottom: 0,
  },
  productImageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  productThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  period: {
    fontSize: 14,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  features: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  outOfStock: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: 13,
    fontWeight: '700',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  buyButtonList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
  },
});
