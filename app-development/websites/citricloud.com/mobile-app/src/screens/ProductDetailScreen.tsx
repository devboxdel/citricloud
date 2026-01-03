import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { useColors } from '../theme/colors';
import { shopAPI } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function ProductDetailScreen({ route, navigation }: any) {
  const colors = useColors();
  const { productSlug, productId } = route.params || {};
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Ensure image URLs are absolute and HTTPS
  const resolveImageUrl = (rawUrl: string): string => {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    const url = rawUrl.trim();
    if (!url) return '';
    if (url.startsWith('https://')) return url;
    if (url.startsWith('http://')) return url.replace('http://', 'https://');
    if (url.startsWith('/')) return `https://citricloud.com${url}`;
    return `https://citricloud.com/uploads/${url}`;
  };

  const resolveImagesArray = (images: any): string[] => {
    if (!Array.isArray(images)) return [];
    return images
      .filter((img) => typeof img === 'string' && img.trim())
      .map((img) => resolveImageUrl(img))
      .filter(Boolean);
  };

  useEffect(() => {
    loadProduct();
  }, [productSlug, productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      let data;
      if (productSlug) {
        data = await shopAPI.getProductBySlug(productSlug);
      } else if (productId) {
        data = await shopAPI.getProduct(String(productId));
      }
      console.log('[PRODUCT] Loaded product:', JSON.stringify(data, null, 2));
      setProduct(data);
    } catch (error) {
      console.error('[PRODUCT] Failed to load product:', error);
      Alert.alert('Error', 'Failed to load product details');
      navigation?.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: Number(product.id) || Date.now(),
      slug: product.slug,
      name: productData.name,
      price: Number(productData.price) || 0,
      image: productData.image,
      category: productData.category?.name || productData.category,
      currency: productData.currency || 'USD',
    }, quantity);
    Alert.alert(
      'Added to Cart',
      `${quantity}x ${productData.name} added to your cart`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'Checkout', onPress: () => navigation.navigate('Checkout') }
      ]
    );
  };

  const handlePurchase = () => {
    if (!product) return;
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please log in to make a purchase.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.getParent()?.navigate('Account') }
        ]
      );
      return;
    }
    // Add selected item then navigate to checkout
    addItem({
      id: Number(product.id) || Date.now(),
      slug: product.slug,
      name: productData.name,
      price: Number(productData.price) || 0,
      image: productData.image,
      category: productData.category?.name || productData.category,
      currency: productData.currency || 'USD',
    }, quantity);
    navigation.navigate('Checkout');
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (!product) {
    return (
      <Screen>
        <Card style={styles.card}>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            Product not found.
          </Text>
        </Card>
      </Screen>
    );
  }

  // Normalize product data
  const rawImages = Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const resolvedImages = resolveImagesArray(rawImages);
  const primaryImage = product.image || (Array.isArray(product.images) && product.images[0]) || null;

  const productData = {
    name: product.name || product.title || 'Unknown',
    description: product.description || '',
    short_description: product.short_description || '',
    price: product.price || product.amount || 0,
    sale_price: product.sale_price || null,
    originalPrice: product.sale_price ? product.price : null,
    currency: product.currency || 'USD',
    period: product.period || product.billing_cycle || '',
    stock: product.stock_quantity !== undefined ? product.stock_quantity : (product.stock || 1),
    images: resolvedImages,
    image: primaryImage ? resolveImageUrl(primaryImage) : null,
    category: product.category,
    is_featured: product.is_featured || false,
    features: product.features || product.highlights || [],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {productData.name}
        </Text>
        <Pressable onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image Gallery */}
        {productData.images && productData.images.length > 0 ? (
          <View style={styles.galleryContainer}>
            {/* Main Image */}
            <View style={[styles.mainImageContainer, { backgroundColor: colors.surface }]}>
              <Image
                source={{ uri: productData.images[selectedImageIndex] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            </View>

            {/* Thumbnail Images */}
            {productData.images.length > 1 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.thumbnailScroll}
              >
                {productData.images.map((image: string, index: number) => (
                  <Pressable
                    key={index}
                    onPress={() => setSelectedImageIndex(index)}
                    style={[
                      styles.thumbnail,
                      {
                        backgroundColor: colors.surface,
                        borderColor: selectedImageIndex === index ? colors.accent : colors.border,
                        borderWidth: selectedImageIndex === index ? 2 : 1,
                      }
                    ]}
                  >
                    <Image
                      source={{ uri: image }}
                      style={styles.thumbnailImage}
                      resizeMode="contain"
                    />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        ) : productData.image ? (
          <View style={[styles.mainImageContainer, { backgroundColor: colors.surface }]}>
            <Image
              source={{ uri: productData.image }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          </View>
        ) : null}

        {/* Product Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {productData.name}
            </Text>
            {productData.category && (
              <View style={[styles.categoryBadge, { backgroundColor: colors.accent + '20' }]}>
                <Text style={[styles.categoryText, { color: colors.accent }]}>
                  {productData.category.name || productData.category}
                </Text>
              </View>
            )}
            {productData.is_featured && (
              <View style={[styles.featuredBadge, { backgroundColor: '#fbbf24' + '20' }]}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={[styles.featuredText, { color: '#f59e0b' }]}>
                  Featured
                </Text>
              </View>
            )}
          </View>

          {/* Short Description */}
          {productData.short_description && (
            <Text style={[styles.shortDescription, { color: colors.textSecondary }]}>
              {productData.short_description}
            </Text>
          )}

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={[styles.price, { color: colors.accent }]}>
              {productData.price} {productData.currency}
            </Text>
            {productData.originalPrice && (
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                {productData.originalPrice}
              </Text>
            )}
            {productData.sale_price && (
              <View style={[styles.discountBadge, { backgroundColor: '#dc2626' + '20' }]}>
                <Text style={[styles.discountText, { color: '#dc2626' }]}>
                  Save {Math.round(((productData.price - productData.sale_price) / productData.price) * 100)}%
                </Text>
              </View>
            )}
            {productData.period && (
              <Text style={[styles.period, { color: colors.textSecondary }]}>
                /{productData.period}
              </Text>
            )}
          </View>

          {/* Stock Status */}
          {productData.stock !== undefined && (
            <View style={styles.stockSection}>
              <Ionicons 
                name={productData.stock > 0 ? 'checkmark-circle' : 'close-circle'} 
                size={18} 
                color={productData.stock > 0 ? '#10b981' : '#ef4444'} 
              />
              <Text style={[styles.stockText, { color: productData.stock > 0 ? '#10b981' : '#ef4444' }]}>
                {productData.stock > 0 ? `${productData.stock} in stock` : 'Out of stock'}
              </Text>
            </View>
          )}

          {/* Description */}
          {productData.description && (
            <View style={styles.descriptionSection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Description
              </Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {productData.description}
              </Text>
            </View>
          )}

          {/* Features */}
          {productData.features && productData.features.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Features
              </Text>
              {productData.features.map((feature: any, idx: number) => (
                <View key={idx} style={styles.featureRow}>
                  <Ionicons name="checkmark" size={18} color={colors.accent} />
                  <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                    {typeof feature === 'string' ? feature : feature.name || feature.description}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Quantity Selector */}
          {productData.stock !== 0 && (
            <View style={styles.quantitySection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Quantity
              </Text>
              <View style={[styles.quantitySelector, { borderColor: colors.accent }]}>
                <Pressable 
                  style={styles.quantityButton}
                  onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                >
                  <Ionicons name="remove" size={20} color={colors.accent} />
                </Pressable>
                <Text style={[styles.quantityValue, { color: colors.textPrimary }]}>
                  {quantity}
                </Text>
                <Pressable 
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Ionicons name="add" size={20} color={colors.accent} />
                </Pressable>
              </View>
            </View>
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {productData.stock !== 0 && (
            <>
              <Pressable 
                style={[styles.addToCartButton, { backgroundColor: colors.accent + '15', borderColor: colors.accent, borderWidth: 2 }]}
                onPress={handleAddToCart}
              >
                <Ionicons name="cart" size={20} color={colors.accent} />
                <Text style={[styles.addToCartText, { color: colors.accent }]}>
                  Add to Cart
                </Text>
              </Pressable>

              <Pressable 
                style={[styles.buyButton, { backgroundColor: colors.accent }]}
                onPress={handlePurchase}
              >
                <Text style={[styles.buyButtonText, { color: colors.background }]}>
                  Buy Now
                </Text>
              </Pressable>
            </>
          )}
          {productData.stock === 0 && (
            <View style={[styles.unavailableButton, { backgroundColor: colors.muted + '20' }]}>
              <Text style={[styles.unavailableText, { color: colors.muted }]}>
                Out of Stock
              </Text>
            </View>
          )}
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <View style={[styles.benefitCard, { borderColor: colors.border }]}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.accent + '10' }]}>
              <Ionicons name="rocket-outline" size={24} color={colors.accent} />
            </View>
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, { color: colors.textPrimary }]}>
                Fast Delivery
              </Text>
              <Text style={[styles.benefitDesc, { color: colors.textSecondary }]}>
                Ships within 24 hours
              </Text>
            </View>
          </View>
          <View style={[styles.benefitCard, { borderColor: colors.border }]}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.accent + '10' }]}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.accent} />
            </View>
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, { color: colors.textPrimary }]}>
                Secure Payment
              </Text>
              <Text style={[styles.benefitDesc, { color: colors.textSecondary }]}>
                100% secure transactions
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    // Use themed border color during render
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  galleryContainer: {
    marginBottom: 24,
  },
  mainImageContainer: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 0,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  thumbnailScroll: {
    marginBottom: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  infoCard: {
    marginBottom: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '600',
  },
  shortDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceSection: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  period: {
    fontSize: 14,
  },
  stockSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  featuresSection: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    justifyContent: 'space-between',
  },
  quantityButton: {
    padding: 8,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsSection: {
    gap: 12,
    marginBottom: 32,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 12,
  },
  buyButton: {
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  unavailableButton: {
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
});
