import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator, useWindowDimensions, Image, TextInput } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { useColors } from '../theme/colors';
import { getIoniconName } from '../lib/iconMapping';
import { blogAPI } from '../lib/api';

export default function BlogScreen({ navigation }: any) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadPosts();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await blogAPI.getCategories();
      console.log('[BLOG] Loaded', data.length, 'categories');
      setCategories(data);
    } catch (error) {
      console.error('[BLOG] Failed to load categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getPosts(selectedCategory);
      const items = Array.isArray(response) ? response : (response?.items || []);
      console.log('[BLOG] Loaded', items.length, 'posts');
      setPosts(items);
    } catch (error) {
      console.error('[BLOG] Failed to load posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReadMore = (post: any) => {
    navigation.navigate('BlogDetail', {
      slug: post.slug || String(post.id),
      id: post.id,
      title: post.title,
    });
  };

  const resolveImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `https://my.citricloud.com${url}`;
    return null;
  };

  return (
    <Screen>
      <SectionHeader 
        title="News" 
        subtitle="Latest news and updates from CitriCloud"
      />

      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder="Search posts..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: colors.textPrimary }]}
        />
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
            {categories.map((category) => {
              const normalizedIcon = (category.icon || '').toString().trim().toLowerCase();
              const isFeatherType = normalizedIcon === 'type';
              const baseIoniconName = getIoniconName(category.icon);
              
              // Don't add -outline suffix if icon already ends with 'cam' or is a special icon
              const ioniconName = (baseIoniconName.endsWith('cam') || baseIoniconName.endsWith('o')) 
                ? baseIoniconName 
                : (baseIoniconName + '-outline') as any;

              return (
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
                {isFeatherType ? (
                  <Feather
                    name="type"
                    size={14}
                    color={selectedCategory === category.id ? '#fff' : colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                ) : (
                  <Ionicons
                    name={ioniconName}
                    size={16}
                    color={selectedCategory === category.id ? '#fff' : colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  style={[
                    styles.categoryText,
                    { color: selectedCategory === category.id ? '#fff' : colors.textPrimary },
                  ]}
                >
                  {category.name}
                </Text>
                {category.post_count !== undefined && (
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
                      {category.post_count}
                    </Text>
                  </View>
                )}
              </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : posts.length > 0 ? (
        <View style={isTablet ? styles.gridContainer : undefined}>
          {posts.filter((post) => {
            const matchesSearch = !searchQuery.trim() || 
              post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.content?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
          }).map((post, idx) => {
            const imageUrl = resolveImageUrl(post.featured_image || post.image);
            const hasVideo = post.media_type === 'video' || post.has_video || (post.video_url && post.video_url.trim() !== '');
            
            // Check if post belongs to Videos category
            const postCategories = Array.isArray(post.categories) ? post.categories : [];
            const videoCategorySelected = categories.find(cat => 
              cat.name?.toLowerCase().includes('video') || cat.slug?.toLowerCase().includes('video')
            );
            const isVideoCategory = postCategories.some((cat: any) => 
              cat.name?.toLowerCase().includes('video') || cat.slug?.toLowerCase().includes('video')
            ) || post.category_name?.toLowerCase().includes('video') 
              || (videoCategorySelected && selectedCategory === videoCategorySelected.id)
              || post.category_id === videoCategorySelected?.id;
            
            return (
            <View key={post.id || idx} style={isTablet ? styles.gridItem : undefined}>
              <Pressable onPress={() => handleReadMore(post)} style={styles.newsItem}>
                {imageUrl && (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.postImage} 
                      resizeMode="cover"
                    />
                    {isVideoCategory && (
                      <View style={[styles.videoBadge, { backgroundColor: colors.accent }]}>
                        <Ionicons name="videocam" size={12} color="#ffffff" style={{ marginRight: 2 }} />
                        <Text style={styles.videoBadgeText}>Videos</Text>
                      </View>
                    )}
                    {hasVideo && (
                      <View style={[styles.videoOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
                        <Ionicons name="play-circle" size={40} color="#ffffff" />
                      </View>
                    )}
                  </View>
                )}
                <View style={styles.postContent}>
                  <Text style={[styles.postTitle, { color: colors.textPrimary }]} numberOfLines={3}>
                    {post.title}
                  </Text>
                </View>
              </Pressable>
            </View>
          )})}
        </View>
      ) : (
        <Card style={styles.card}>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            No news articles available yet.
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
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  newsItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    width: 90,
    height: 90,
    marginRight: 12,
    flexShrink: 0,
  },
  postImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    zIndex: 10,
  },
  videoBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
  },
  postContent: {
    flex: 1,
    padding: 12,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  postMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
  },
});
