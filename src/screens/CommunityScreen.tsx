import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  addComment,
  createPost,
  getCommunityPosts,
  getProfile,
  toggleLike,
} from '../api/services';
import type { CommunityPost } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { ThemeColors, cardShadow, radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTabScrollBottomPadding } from '../hooks/useTabScrollBottomPadding';

export function CommunityScreen() {
  const { user } = useAuth();
  const { colors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const elevation = useMemo(() => cardShadow(mode), [mode]);
  const scrollBottomPad = useTabScrollBottomPadding();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const p = await getCommunityPosts();
      setPosts(p);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  async function onLike(postId: string) {
    try {
      await toggleLike(postId);
      await load();
    } catch {
      /* ignore */
    }
  }

  async function onComment(postId: string) {
    const text = commentText[postId]?.trim();
    if (!text || !user) return;
    let name = user.email.split('@')[0];
    try {
      const prof = await getProfile();
      name = prof.fullName;
    } catch {
      /* use email prefix */
    }
    try {
      await addComment(postId, text, name);
      setCommentText((c) => ({ ...c, [postId]: '' }));
      await load();
    } catch {
      /* ignore */
    }
  }

  async function submitPost() {
    if (!user || !title.trim() || !content.trim()) return;
    let authorName = user.email.split('@')[0];
    try {
      const prof = await getProfile();
      authorName = prof.fullName;
    } catch {
      /* */
    }
    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        focusArea: 'Mobile',
        tags: ['react-native'],
        authorName,
        authorType: 'developer',
      });
      setModal(false);
      setTitle('');
      setContent('');
      await load();
    } catch {
      /* */
    }
  }

  return (
    <ScreenScaffold title="Сообщество" loading={loading}>
      <View style={styles.screenBody}>
        <View style={styles.toolbar}>
          <PrimaryButton
            label="Новый пост"
            onPress={() => setModal(true)}
            disabled={!user}
          />
        </View>
        <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: scrollBottomPad }]}
        style={styles.listFlex}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.accent}
          />
        }
        renderItem={({ item }) => {
          const liked = user ? item.likedByUserIds.includes(user.id) : false;
          return (
            <View style={[styles.card, elevation]}>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.author}>
                {item.authorName} · {item.focusArea}
              </Text>
              <Text style={styles.postBody}>{item.content}</Text>
              <View style={styles.row}>
                <Pressable onPress={() => user && onLike(item.id)}>
                  <Text style={[styles.like, liked && styles.liked]}>
                    ♥ {item.likes}
                  </Text>
                </Pressable>
              </View>
              {item.comments?.length ? (
                item.comments.map((c) => (
                  <Text key={c.id} style={styles.comment}>
                    <Text style={styles.cAuthor}>{c.authorName}: </Text>
                    {c.text}
                  </Text>
                ))
              ) : null}
              {user ? (
                <View style={styles.commentRow}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Комментарий..."
                    placeholderTextColor={colors.textMuted}
                    value={commentText[item.id] ?? ''}
                    onChangeText={(t) =>
                      setCommentText((x) => ({ ...x, [item.id]: t }))
                    }
                  />
                  <PrimaryButton
                    label="→"
                    onPress={() => onComment(item.id)}
                    style={styles.sendBtn}
                  />
                </View>
              ) : null}
            </View>
          );
        }}
      />
      </View>

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Новый пост</Text>
            <TextInput
              style={styles.input}
              placeholder="Заголовок"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.area]}
              placeholder="Текст"
              placeholderTextColor={colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
            />
            <PrimaryButton label="Опубликовать" onPress={submitPost} />
            <PrimaryButton
              label="Отмена"
              variant="outline"
              onPress={() => setModal(false)}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
      </Modal>
    </ScreenScaffold>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  screenBody: { flex: 1 },
  toolbar: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  listFlex: { flex: 1 },
  list: { paddingHorizontal: spacing.md, flexGrow: 1 },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  author: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  postBody: { color: colors.text, marginTop: spacing.sm, lineHeight: 22 },
  row: { marginTop: spacing.sm },
  like: { color: colors.textMuted, fontSize: 16 },
  liked: { color: colors.danger },
  comment: { color: colors.textMuted, marginTop: spacing.xs, fontSize: 13 },
  cAuthor: { color: colors.accent, fontWeight: '600' },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
  },
  sendBtn: { paddingHorizontal: spacing.md },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  area: { minHeight: 100, textAlignVertical: 'top' },
});
