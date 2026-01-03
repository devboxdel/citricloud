// Mobile App: Video Icon Overlay Implementation
// This is the exact code pattern from the web frontend (Blog.tsx, lines 80-495)
// Apply this to your News/Blog list screens in the mobile app

/**
 * STEP 1: Add the helper function to your News/Blog List screen component
 */

const isVideoCategory = (post: any) => {
  const cat = categories.find((c: any) => c.id === post?.category_id);
  return cat?.icon === 'video' || cat?.icon === 'film';
};

/**
 * STEP 2: Ensure you have categories loaded
 */

const [categories, setCategories] = useState<any[]>([]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await fetch('https://my.citricloud.com/api/v1/cms/public/categories');
      const data = await response.json();
      setCategories(data.items || data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };
  
  fetchCategories();
}, []);

/**
 * STEP 3: In your News/Blog item render, add the video overlay
 * This example shows how to structure the featured image container
 */

// Example: In a FlatList or ScrollView rendering news items
{item.featured_image && (
  <View style={{
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    height: 200,
    backgroundColor: '#f3f4f6'
  }}>
    {/* Featured Image */}
    <Image
      source={{
        uri: resolveImageUrl(item.featured_image) // Use your existing function
      }}
      style={{
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
      }}
    />
    
    {/* VIDEO ICON OVERLAY - Add this block */}
    {isVideoCategory(item) && (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)', // 30% black overlay
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28, // 50% for circle
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // White with slight transparency
            justifyContent: 'center',
            alignItems: 'center',
            // Shadow for elevation
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5 // Android shadow
          }}
        >
          {/* Ionicons play circle icon - blue color (#0066cc is primary-600) */}
          <Ionicons
            name="play-circle"
            size={48}
            color="#0066cc" // Primary blue
          />
        </View>
      </View>
    )}
  </View>
)}

/**
 * STEP 4: Compare with Featured Post (larger size)
 * If you have a featured post section, use larger sizes:
 */

{featuredPost.featured_image && (
  <View style={{
    overflow: 'hidden',
    height: 300,
    position: 'relative',
    borderRadius: 20
  }}>
    <Image
      source={{
        uri: resolveImageUrl(featuredPost.featured_image)
      }}
      style={{
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
      }}
    />
    
    {/* Larger video icon for featured post */}
    {isVideoCategory(featuredPost) && (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5
          }}
        >
          {/* Larger icon for featured post */}
          <Ionicons
            name="play-circle"
            size={64}
            color="#0066cc"
          />
        </View>
      </View>
    )}
  </View>
)}

/**
 * REQUIRED IMPORTS
 */

import { View, Image, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * ALTERNATIVE ICON OPTIONS
 * If "play-circle" doesn't exist in Ionicons, try these alternatives:
 * 
 * <Ionicons name="play" size={48} color="#0066cc" />
 * <Ionicons name="play-sharp" size={48} color="#0066cc" />
 * <Ionicons name="videocam" size={48} color="#0066cc" />
 * <Ionicons name="film" size={48} color="#0066cc" />
 * 
 * Check available icons at: https://ionic.io/ionicons
 */

/**
 * STYLING NOTES
 * 
 * Colors:
 * - Overlay: rgba(0, 0, 0, 0.3) = 30% black
 * - Circle background: rgba(255, 255, 255, 0.9) = 90% white
 * - Icon color: #0066cc = Primary blue
 * 
 * Sizes (scale-able):
 * - Small cards: 56x56 circle, 48px icon
 * - Large cards: 80x80 circle, 64px icon
 * - Featured: 80x80 circle, 64px icon
 * 
 * Shadows:
 * - Platform independent using elevation (Android) + shadowColor (iOS)
 */

/**
 * TYPESCRIPT TYPES
 */

interface NewsItem {
  id: number;
  title: string;
  featured_image?: string;
  category_id: number;
  content: string;
  published_at?: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string; // Can be 'video', 'film', or other icon names
}

/**
 * FULL COMPONENT EXAMPLE
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NewsListScreen = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function: Check if item is in video category
  const isVideoCategory = (item: NewsItem) => {
    const category = categories.find(c => c.id === item.category_id);
    return category?.icon === 'video' || category?.icon === 'film';
  };

  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          'https://my.citricloud.com/api/v1/cms/public/categories'
        );
        const data = await response.json();
        setCategories(data.items || data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Load news items
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://my.citricloud.com/api/v1/cms/public/blog/posts'
        );
        const data = await response.json();
        setNewsItems(data.items || data);
      } catch (error) {
        console.error('Failed to load news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Render individual news item
  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigateToDetail(item)}
      activeOpacity={0.7}
    >
      {/* Featured Image with Video Overlay */}
      {item.featured_image && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: resolveImageUrl(item.featured_image) }}
            style={styles.image}
          />

          {/* Video Icon Overlay */}
          {isVideoCategory(item) && (
            <View style={styles.overlay}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="play-circle"
                  size={48}
                  color="#0066cc"
                />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>
          {new Date(item.published_at || item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>News</Text>
      <FlatList
        data={newsItems}
        renderItem={renderNewsItem}
        keyExtractor={item => item.id.toString()}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

// StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#000'
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
    borderRadius: 12
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  content: {
    padding: 16
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8
  },
  date: {
    fontSize: 12,
    color: '#6b7280'
  }
});

export default NewsListScreen;

/**
 * TESTING CHECKLIST
 * 
 * ✓ Video icon appears on items with category icon 'video'
 * ✓ Video icon appears on items with category icon 'film'
 * ✓ Video icon does NOT appear on other categories
 * ✓ Icon size is appropriate for card size
 * ✓ Overlay color doesn't obscure image too much
 * ✓ Icon is centered and circular
 * ✓ Works on both light and dark themes (if applicable)
 * ✓ Tapping item navigates to detail screen
 * ✓ Performance is smooth with multiple items
 */
