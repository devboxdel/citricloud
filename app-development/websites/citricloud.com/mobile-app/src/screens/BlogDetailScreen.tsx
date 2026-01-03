import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Image, ActivityIndicator, useWindowDimensions, Linking, Share, TextInput, KeyboardAvoidingView, Platform, Alert, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/colors';
import { Card } from '../components/Card';
import RenderHTML from 'react-native-render-html';
import { blogAPI } from '../lib/api';
import { connectCommentsSocket, type CommentEvent } from '../lib/realtime';
import { useAuthStore } from '../store/authStore';

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: Date;
  userId?: number | string;
  avatar?: string;
  likes: string[]; // Array of user IDs who liked
  dislikes: string[]; // Array of user IDs who disliked
}

export default function BlogDetailScreen({ route, navigation }: any) {
  const colors = useColors();
  const { slug, id, title } = route.params || {};
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const [showEmojis, setShowEmojis] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [lastCommentAt, setLastCommentAt] = useState<number | null>(null);
  const [hasLink, setHasLink] = useState(false);
  const [spamHint, setSpamHint] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '👏', '🙏', '✨', '😍', '🤔', '😎', '💪', '🚀'];

  useEffect(() => {
    navigation?.setOptions?.({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // We prefer fetching by id; if we only have slug, we can fallback by list search
        if (id) {
          const data = await blogAPI.getPost(id);
          if (mounted) {
            setPost(data);
            // Load related posts if not included in main post data
            if (!data?.related_posts || data.related_posts.length === 0) {
              loadRelatedPosts(data?.category_id, data?.id);
            } else {
              setRelatedPosts(data.related_posts);
            }
          }
        } else {
          // Fallback: find by slug from public list
          const list = await blogAPI.getPosts();
          const items = Array.isArray(list) ? list : list?.items || [];
          const found = items.find((p: any) => p.slug === slug || String(p.id) === String(slug));
          if (found) {
            const data = await blogAPI.getPost(found.id);
            if (mounted) {
              setPost(data);
              if (!data?.related_posts || data.related_posts.length === 0) {
                loadRelatedPosts(data?.category_id, data?.id);
              } else {
                setRelatedPosts(data.related_posts);
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to load post:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, slug]);

  const loadRelatedPosts = async (categoryId: number | null | undefined, postId: number | null | undefined) => {
    if (!categoryId || !postId) return;
    try {
      const response = await blogAPI.getPosts(categoryId);
      const items = Array.isArray(response) ? response : (response?.items || []);
      const related = items.filter((p: any) => p.id !== postId).slice(0, 3);
      setRelatedPosts(related);
    } catch (e) {
      console.error('Failed to load related posts:', e);
    }
  };

  // Fetch comments from backend and poll for updates
  useEffect(() => {
    if (!post?.id) return;
    let mounted = true;
    let socketHandle: { close: () => void } | null = null;

    const mapServerComment = (c: any): Comment => ({
      id: Number(c.id ?? Date.now()),
      author: c.author?.name || c.author || c.user?.username || c.user?.email || 'Anonymous',
      content: String(c.content ?? c.text ?? ''),
      timestamp: new Date(c.created_at || c.timestamp || Date.now()),
      userId: c.user_id || c.user?.id || c.userId,
      avatar: c.author?.avatar || c.user?.avatar || undefined,
      likes: Array.isArray(c.likes) ? c.likes.map((x: any) => String(x)) : [],
      dislikes: Array.isArray(c.dislikes) ? c.dislikes.map((x: any) => String(x)) : [],
    });

    const load = async () => {
      try {
        const list = await blogAPI.getComments(post.id);
        if (!mounted) return;
        const mapped = Array.isArray(list) ? list.map(mapServerComment) : [];
        setComments(mapped);
      } catch (e) {
        // Ignore transient errors
      }
    };

    load();
    // Live updates via WebSocket; keep polling as fallback
    socketHandle = connectCommentsSocket(post.id, (evt: CommentEvent) => {
      if (!mounted) return;
      if (evt.type === 'comment_created') {
        const c = evt.comment;
        const exists = comments.some(x => String(x.id) === String(c.id));
        const newItem = {
          id: Number(c.id ?? Date.now()),
          author: c.author?.name || c.author || c.user?.username || c.user?.email || 'Anonymous',
          content: String(c.content ?? c.text ?? ''),
          timestamp: new Date(c.created_at || c.timestamp || Date.now()),
          userId: c.user_id || c.user?.id || c.userId,
          avatar: c.author?.avatar || c.user?.avatar || undefined,
          likes: Array.isArray(c.likes) ? c.likes.map((x: any) => String(x)) : [],
          dislikes: Array.isArray(c.dislikes) ? c.dislikes.map((x: any) => String(x)) : [],
        };
        if (!exists) setComments(prev => [newItem, ...prev]);
      } else if (evt.type === 'comment_deleted') {
        setComments(prev => prev.filter(x => Number(x.id) !== Number(evt.commentId)));
      } else if (evt.type === 'comment_liked') {
        setComments(prev => prev.map(x => {
          if (Number(x.id) !== Number(evt.commentId)) return x;
          const uid = String(evt.userId ?? '');
          const has = uid && x.likes.includes(uid);
          return {
            ...x,
            likes: uid ? (has ? x.likes.filter(v => v !== uid) : [...x.likes, uid]) : x.likes,
            dislikes: uid ? x.dislikes.filter(v => v !== uid) : x.dislikes,
          };
        }));
      } else if (evt.type === 'comment_disliked') {
        setComments(prev => prev.map(x => {
          if (Number(x.id) !== Number(evt.commentId)) return x;
          const uid = String(evt.userId ?? '');
          const has = uid && x.dislikes.includes(uid);
          return {
            ...x,
            dislikes: uid ? (has ? x.dislikes.filter(v => v !== uid) : [...x.dislikes, uid]) : x.dislikes,
            likes: uid ? x.likes.filter(v => v !== uid) : x.likes,
          };
        }));
      }
    });

    const interval = setInterval(load, 12000);
    return () => {
      mounted = false;
      clearInterval(interval);
      socketHandle?.close?.();
    };
  }, [post?.id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={[styles.header, { borderBottomColor: colors.border }]}> 
          <Pressable onPress={() => navigation?.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.textPrimary }]}> 
            {title || 'Article'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={[styles.header, { borderBottomColor: colors.border }]}> 
          <Pressable onPress={() => navigation?.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.textPrimary }]}> 
            {title || 'Article'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: colors.textSecondary }}>Post not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const content = String(post.content || '');
  const publishedAt = post.published_at || post.created_at;
  const rawImage = post.featured_image || post.image;
  const category = post.category?.name || post.category || null;
  const author = post.author?.name || post.author || null;
  const wordCount = content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));
  const tags: string[] = Array.isArray(post.tags)
    ? post.tags.map((t: any) => t?.name || t).filter(Boolean)
    : (post.tag_list || []).map((t: any) => t?.name || t).filter(Boolean);

  // Resolve relative image paths to absolute URLs for React Native
  const resolveImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `https://my.citricloud.com${url}`;
    return null;
  };
  
  const imageUrl = resolveImageUrl(rawImage);

  const tagsStyles = {
    body: { color: colors.textPrimary, lineHeight: 22 },
    p: { color: colors.textPrimary, fontSize: 15 },
    h1: { color: colors.textPrimary },
    h2: { color: colors.textPrimary },
    h3: { color: colors.textPrimary },
    a: { color: colors.accent },
  } as const;

  const onLinkPress = (_: any, href?: string) => {
    if (!href) return;
    Linking.openURL(href);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      // Prompt login
      return;
    }
    if (hasLink) {
      Alert.alert('Links Forbidden', 'Please remove links to prevent spam.');
      return;
    }
    const nowTs = Date.now();
    if (lastCommentAt && nowTs - lastCommentAt < 15000) {
      const waitMs = 15000 - (nowTs - lastCommentAt);
      Alert.alert('Slow down', `Please wait ${Math.ceil(waitMs / 1000)}s before posting again.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const platform = Platform.OS === 'ios' ? 'iOS' : 'Android';
      const created = await blogAPI.createComment(post.id, newComment.trim(), platform);
      console.log('[Comment] API response:', JSON.stringify(created, null, 2));
      
      // Handle null or empty response
      if (!created) {
        console.error('Comment creation returned null/undefined response');
        Alert.alert('Error', 'Failed to submit comment. Please try again.');
        return;
      }

      const newItem: Comment = {
        id: Number(created?.id ?? Date.now()),
        author: created?.author?.name || user?.username || user?.email || 'Anonymous',
        content: String(created?.content ?? newComment.trim()),
        timestamp: new Date(created?.created_at || Date.now()),
        userId: created?.user_id || user?.id || user?.email,
        likes: Array.isArray(created?.likes) ? created.likes.map((x: any) => String(x)) : [],
        dislikes: Array.isArray(created?.dislikes) ? created.dislikes.map((x: any) => String(x)) : [],
      };
      setComments([newItem, ...comments]);
      setNewComment('');
      setShowEmojis(false);
      setLastCommentAt(Date.now());
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } catch (error: any) {
      console.error('Failed to submit comment:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to submit comment';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              try {
                await blogAPI.deleteComment(post.id, commentId);
              } catch (e) {
                // If delete fails, don't change UI
                console.error('Delete comment failed:', e);
                return;
              }
              const updatedComments = comments.filter(c => c.id !== commentId);
              setComments(updatedComments);
            } catch (error) {
              console.error('Failed to delete comment:', error);
            }
          }
        }
      ]
    );
  };

  const handleLikeComment = async (commentId: number) => {
    if (!user) return;
    
    const userId = String(user.id || user.email);
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const hasLiked = comment.likes.includes(userId);
        const hasDisliked = comment.dislikes.includes(userId);
        
        return {
          ...comment,
          likes: hasLiked 
            ? comment.likes.filter(id => id !== userId)
            : [...comment.likes, userId],
          dislikes: hasDisliked
            ? comment.dislikes.filter(id => id !== userId)
            : comment.dislikes,
        };
      }
      return comment;
    });
    
    setComments(updatedComments);
    try {
      await blogAPI.likeComment(post.id, commentId);
    } catch (e) {
      // Revert on failure
      setComments(comments);
    }
  };

  const handleDislikeComment = async (commentId: number) => {
    if (!user) return;
    
    const userId = String(user.id || user.email);
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const hasLiked = comment.likes.includes(userId);
        const hasDisliked = comment.dislikes.includes(userId);
        
        return {
          ...comment,
          dislikes: hasDisliked
            ? comment.dislikes.filter(id => id !== userId)
            : [...comment.dislikes, userId],
          likes: hasLiked
            ? comment.likes.filter(id => id !== userId)
            : comment.likes,
        };
      }
      return comment;
    });
    
    setComments(updatedComments);
    try {
      await blogAPI.dislikeComment(post.id, commentId);
    } catch (e) {
      // Revert on failure
      setComments(comments);
    }
  };

  const insertEmoji = (emoji: string) => {
    setNewComment(newComment + emoji);
  };

  const urlRegex = /(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-z]{2,})(\S*)/i;
  const excessiveRepeatRegex = /(.)\1{6,}/;

  const onChangeComment = (text: string) => {
    setNewComment(text);
    const linkDetected = urlRegex.test(text);
    setHasLink(linkDetected);
    if (linkDetected) {
      setSpamHint('Links are not allowed.');
    } else if (excessiveRepeatRegex.test(text)) {
      setSpamHint('Please avoid excessive repeated characters.');
    } else {
      setSpamHint(null);
    }
  };

  const formatCommentTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}> 
      {/* Hero Image Header */}
      {imageUrl ? (
        <View style={styles.heroContainer}>
          <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay} />
          <View style={[styles.headerOverlay, { borderBottomColor: 'transparent' }]}> 
            <Pressable onPress={() => navigation?.goBack()} style={[styles.headerButton, styles.overlayButton]}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.heroTitleContainer}>
            <Text style={styles.heroTitle}>
              {post.title}
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.header, { borderBottomColor: colors.border }]}> 
          <Pressable onPress={() => navigation?.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.textPrimary }]}> 
            {post.title || title || 'Article'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      )}
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

        {/* Blog Info */}
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                {author ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="person-circle-outline" size={18} color={colors.muted} />
                    <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 6 }}>{author}</Text>
                  </View>
                ) : null}
                {publishedAt ? (
                  <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: author ? 12 : 0 }}>
                    {new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>
                ) : null}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="time-outline" size={16} color={colors.muted} />
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 6 }}>
                  {readingMinutes} min read
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
                {category ? (
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.accent + '1A', marginRight: 6 }}>
                    <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>{category}</Text>
                  </View>
                ) : null}
                {tags?.length ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {tags.slice(0, 6).map((t: string) => (
                      <View key={t} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.accent + '1A', marginRight: 6, marginBottom: 6 }}>
                        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>#{t}</Text>
                      </View>
                    ))}
                    {tags.length > 6 && (
                      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>+{tags.length - 6} more</Text>
                      </View>
                    )}
                  </View>
                ) : null}
              </View>
            </View>

            <Pressable
              onPress={async () => {
                const slugOrId = post.slug || post.id;
                const url = slugOrId ? `https://citricloud.com/news/${slugOrId}` : 'https://citricloud.com/news';
                try {
                  await Share.share({ message: `${post.title}\n${url}` });
                } catch (_) {}
              }}
              style={{ padding: 8 }}
            >
              <Ionicons name="share-social-outline" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          
        </Card>

        <RenderHTML
          contentWidth={width - 32}
          source={{ html: content }}
          tagsStyles={tagsStyles}
          enableExperimentalMarginCollapsing
          renderersProps={{ a: { onPress: (_: any, href?: string) => onLinkPress(_, href) } }}
        />

        {/* Related Posts */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 12, paddingHorizontal: 4 }}>
            Related Posts
          </Text>
          {relatedPosts && relatedPosts.length > 0 ? (
            relatedPosts.slice(0, 3).map((relatedPost: any) => (
              <Pressable
                key={relatedPost.id}
                onPress={() => {
                  navigation.push('BlogDetail', {
                    slug: relatedPost.slug || String(relatedPost.id),
                    id: relatedPost.id,
                    title: relatedPost.title,
                  });
                }}
                style={{ marginBottom: 12 }}
              >
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {relatedPost.featured_image && (
                      <Image
                        source={{ uri: relatedPost.featured_image }}
                        style={{ width: 80, height: 80, borderRadius: 8, marginRight: 12 }}
                        resizeMode="cover"
                      />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 }} numberOfLines={2}>
                        {relatedPost.title}
                      </Text>
                      {relatedPost.published_at && (
                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                          {new Date(relatedPost.published_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                      )}
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))
          ) : (
            <Card>
              <View style={{ padding: 16 }}>
                <Text style={{ color: colors.textSecondary }}>No related posts yet.</Text>
              </View>
            </Card>
          )}
        </View>

        {/* Comments Section */}
        <Card style={{ marginTop: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
              Comments ({comments.length})
            </Text>
            <Pressable onPress={() => setShowRules(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
              <Text style={{ color: colors.accent, marginLeft: 6, fontWeight: '600' }}>Rules</Text>
            </Pressable>
          </View>
          
          {/* Success Message */}
          {showSuccessMessage && (
            <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#dcfce7', borderRadius: 12, borderWidth: 1, borderColor: '#86efac' }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#166534', marginBottom: 4 }}>Thank you for your comment!</Text>
                  <Text style={{ fontSize: 13, color: '#15803d', lineHeight: 18 }}>Your comment is under review by our Editorial team. It will be published shortly after moderation.</Text>
                </View>
              </View>
            </View>
          )}

          {/* Comment Input */}
          {user ? (
            <View style={{ marginBottom: 20 }}>
              <View style={[styles.commentInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.commentInput, { color: colors.textPrimary }]}
                  placeholder="Add a comment..."
                  placeholderTextColor={colors.muted}
                  value={newComment}
                  onChangeText={onChangeComment}
                  multiline
                  maxLength={500}
                />
              </View>
              
              {/* Emoji Picker */}
              {showEmojis && (
                <View style={[styles.emojiContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {commonEmojis.map((emoji, index) => (
                      <Pressable
                        key={index}
                        onPress={() => insertEmoji(emoji)}
                        style={styles.emojiButton}
                      >
                        <Text style={{ fontSize: 24 }}>{emoji}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Pressable
                    onPress={() => setShowEmojis(!showEmojis)}
                    style={{ padding: 8, marginRight: 8 }}
                  >
                    <Ionicons name="happy-outline" size={20} color={showEmojis ? colors.accent : colors.muted} />
                  </Pressable>
                  {spamHint && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                      <Ionicons name="alert-circle-outline" size={16} color={colors.accent} />
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 4 }}>{spamHint}</Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 12, color: colors.muted }}>{newComment.length}/500</Text>
                </View>
                <Pressable
                  onPress={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  style={[styles.submitButton, { 
                    backgroundColor: newComment.trim() ? colors.accent : colors.surface,
                    opacity: isSubmitting ? 0.5 : 1
                  }]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{ color: newComment.trim() ? '#fff' : colors.muted, fontWeight: '600' }}>
                      Post
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => navigation.navigate('Home')}
              style={[styles.loginPrompt, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Ionicons name="log-in-outline" size={20} color={colors.accent} />
              <Text style={{ color: colors.textPrimary, marginLeft: 8 }}>
                Sign in to leave a comment
              </Text>
            </Pressable>
          )}

          {/* Comments List */}
          {comments.length > 0 ? (
            <View>
              {comments.map((comment) => (
                <View key={comment.id} style={[styles.commentItem, { borderBottomColor: colors.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={[styles.avatar, { backgroundColor: colors.accent + '20' }]}>
                      <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 16 }}>
                        {comment.author.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>
                            {comment.author}
                          </Text>
                          <Text style={{ color: colors.muted, fontSize: 12, marginLeft: 8 }}>
                            {formatCommentTime(comment.timestamp)}
                          </Text>
                        </View>
                        {user && (comment.userId === user.id || comment.userId === user.email) && (
                          <Pressable
                            onPress={() => handleDeleteComment(comment.id)}
                            style={{ padding: 4 }}
                          >
                            <Ionicons name="trash-outline" size={18} color={colors.muted} />
                          </Pressable>
                        )}
                        {user && (
                          <Pressable
                            onPress={() => { setReportingCommentId(comment.id); setReportReason(''); }}
                            style={{ padding: 4 }}
                          >
                            <Ionicons name="flag-outline" size={18} color={colors.muted} />
                          </Pressable>
                        )}
                      </View>
                      <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20 }}>
                        {comment.content}
                      </Text>
                      
                      {/* Like/Dislike Section */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 16 }}>
                        <Pressable
                          onPress={() => handleLikeComment(comment.id)}
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Ionicons
                            name={user && comment.likes.includes(String(user.id || user.email)) ? "thumbs-up" : "thumbs-up-outline"}
                            size={16}
                            color={user && comment.likes.includes(String(user.id || user.email)) ? colors.accent : colors.muted}
                          />
                          {comment.likes.length > 0 && (
                            <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 4 }}>
                              {comment.likes.length}
                            </Text>
                          )}
                        </Pressable>
                        
                        <Pressable
                          onPress={() => handleDislikeComment(comment.id)}
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Ionicons
                            name={user && comment.dislikes.includes(String(user.id || user.email)) ? "thumbs-down" : "thumbs-down-outline"}
                            size={16}
                            color={user && comment.dislikes.includes(String(user.id || user.email)) ? colors.accent : colors.muted}
                          />
                          {comment.dislikes.length > 0 && (
                            <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 4 }}>
                              {comment.dislikes.length}
                            </Text>
                          )}
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.muted} />
              <Text style={{ color: colors.textSecondary, marginTop: 12, textAlign: 'center' }}>
                No comments yet. Be the first to share your thoughts!
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Rules Modal */}
      <Modal visible={showRules} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>Community Rules</Text>
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>• Be respectful; no harassment or hate speech.</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>• No links or ads; avoid spammy content.</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>• Keep comments relevant and constructive.</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>• Avoid excessive repeated characters or caps.</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable onPress={() => setShowRules(false)} style={[styles.submitButton, { backgroundColor: colors.surface }]}> 
                <Text style={{ color: colors.textPrimary }}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal visible={!!reportingCommentId} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 }}>Report Comment</Text>
            <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>Describe the violation (e.g., hate speech, spam, harassment).</Text>
            <View style={[styles.commentInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <TextInput
                style={[styles.commentInput, { color: colors.textPrimary }]}
                placeholder="Reason"
                placeholderTextColor={colors.muted}
                value={reportReason}
                onChangeText={setReportReason}
                multiline
                maxLength={300}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <Pressable onPress={() => { setReportingCommentId(null); setReportReason(''); }} style={[styles.submitButton, { backgroundColor: colors.surface, marginRight: 8 }]}> 
                <Text style={{ color: colors.textPrimary }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (!reportingCommentId || !post?.id || !reportReason.trim()) return;
                  setIsReporting(true);
                  try {
                    await blogAPI.reportComment(post.id, reportingCommentId, reportReason.trim());
                    Alert.alert('Reported', 'Thank you for your report. Our team will review it.');
                    setReportingCommentId(null);
                    setReportReason('');
                  } catch (e) {
                    Alert.alert('Failed', 'Could not submit the report. Please try again later.');
                  } finally {
                    setIsReporting(false);
                  }
                }}
                disabled={!reportReason.trim() || isReporting}
                style={[styles.submitButton, { backgroundColor: reportReason.trim() ? colors.accent : colors.surface }]}
              >
                {isReporting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: reportReason.trim() ? '#fff' : colors.muted }}>Submit</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  headerButton: { padding: 6 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600' },
  headerSpacer: { width: 28 },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  overlayButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  heroTitleContainer: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    lineHeight: 28,
    textAlign: 'left',
  },
  commentInputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
  },
  commentInput: {
    fontSize: 14,
    lineHeight: 20,
  },
  emojiContainer: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  emojiButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  commentItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webview: { flex: 1 },
});