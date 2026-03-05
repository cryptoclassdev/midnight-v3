import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/lib/store";
import { colors } from "@/constants/theme";
import { fonts, fontSize, letterSpacing } from "@/constants/typography";
import { usePredictionEvents, usePredictionEventSearch } from "@/hooks/usePredictionEvents";
import { usePredictionPositions } from "@/hooks/usePredictionPositions";
import { EventCard } from "@/components/predict/EventCard";
import { CategoryFilter } from "@/components/predict/CategoryFilter";
import type { PredictionEvent, PredictionCategory } from "@mintfeed/shared";
import { PREDICTION_CATEGORIES } from "@mintfeed/shared";

type SortOption = "trending" | "new" | "volume";

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "new", label: "New" },
  { key: "volume", label: "Volume" },
];

const SORT_PARAMS: Record<SortOption, { sortBy?: string; sortDirection?: "asc" | "desc"; filter?: string }> = {
  trending: { sortBy: "volume", sortDirection: "desc" },
  new: { filter: "new" },
  volume: { sortBy: "volume", sortDirection: "desc" },
};

export default function PredictScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const walletAddress = useAppStore((s) => s.walletAddress);
  const themeColors = colors[theme];

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PredictionCategory>("all");
  const [sortOption, setSortOption] = useState<SortOption>("trending");

  const sortParams = SORT_PARAMS[sortOption];

  const {
    data: eventsData,
    fetchNextPage,
    hasNextPage,
    isLoading: eventsLoading,
    refetch: refetchEvents,
    isRefetching,
  } = usePredictionEvents({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    sortBy: sortParams.sortBy,
    sortDirection: sortParams.sortDirection,
    filter: sortParams.filter,
    includeMarkets: true,
  });

  const { data: searchResults, isLoading: searchLoading } =
    usePredictionEventSearch(searchQuery);

  const { data: positionsData } = usePredictionPositions(walletAddress ?? undefined);

  const positionCount = positionsData?.data?.length ?? 0;

  const events = useMemo(() => {
    if (!eventsData?.pages) return [];
    return eventsData.pages.flatMap((page) => page.data);
  }, [eventsData]);

  const displayedEvents = searchQuery.length > 0 ? (searchResults?.data ?? []) : events;
  const isLoading = searchQuery.length > 0 ? searchLoading : eventsLoading;

  const handleEventPress = useCallback(
    (event: PredictionEvent) => {
      router.push(`/predict/event/${event.eventId}`);
    },
    [router],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && searchQuery.length === 0) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, searchQuery]);

  const handleRefresh = useCallback(() => {
    refetchEvents();
  }, [refetchEvents]);

  const toggleSearch = useCallback(() => {
    setSearchVisible((prev) => {
      if (prev) setSearchQuery("");
      return !prev;
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const renderEvent = useCallback(
    ({ item }: { item: PredictionEvent }) => (
      <EventCard event={item} onPress={handleEventPress} />
    ),
    [handleEventPress],
  );

  const keyExtractor = useCallback((item: PredictionEvent) => item.eventId, []);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={40} color={themeColors.textMuted} />
        <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
          No events found
        </Text>
      </View>
    );
  }, [isLoading, themeColors]);

  const renderHeader = useCallback(
    () => (
      <View>
        {/* Category filter */}
        <CategoryFilter
          categories={PREDICTION_CATEGORIES as unknown as string[]}
          selected={selectedCategory}
          onSelect={(cat) => setSelectedCategory(cat as PredictionCategory)}
        />

        {/* Sort options */}
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((option) => {
            const isActive = sortOption === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setSortOption(option.key)}
                style={({ pressed }) => [
                  styles.sortPill,
                  {
                    backgroundColor: isActive
                      ? "rgba(230, 0, 0, 0.12)"
                      : "transparent",
                    borderColor: isActive
                      ? themeColors.accent
                      : themeColors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.sortText,
                    {
                      color: isActive
                        ? themeColors.accent
                        : themeColors.textMuted,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    ),
    [selectedCategory, sortOption, themeColors],
  );

  const renderFooter = useCallback(() => {
    if (!isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={themeColors.accent} />
      </View>
    );
  }, [isLoading, themeColors]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Predict</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={toggleSearch}
            hitSlop={12}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <Ionicons
              name={searchVisible ? "close" : "search-outline"}
              size={22}
              color={themeColors.text}
            />
          </Pressable>
          <Pressable
            onPress={() => router.push("/predict/portfolio")}
            hitSlop={12}
            style={({ pressed }) => [
              styles.portfolioButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="briefcase-outline" size={22} color={themeColors.text} />
            {walletAddress && positionCount > 0 && (
              <View style={[styles.badge, { backgroundColor: themeColors.accent }]}>
                <Text style={styles.badgeText}>{positionCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Search bar */}
      {searchVisible && (
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Ionicons name="search" size={16} color={themeColors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: themeColors.text }]}
              placeholder="Search events..."
              placeholderTextColor={themeColors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={clearSearch} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={themeColors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Events list */}
      <FlatList
        data={displayedEvents}
        renderItem={renderEvent}
        keyExtractor={keyExtractor}
        ListHeaderComponent={searchQuery.length === 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={isRefetching}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontFamily: fonts.display.regular,
    fontSize: fontSize.xxl,
    letterSpacing: letterSpacing.wide,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  portfolioButton: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: fonts.mono.bold,
    fontSize: 9,
    color: "#ffffff",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderCurve: "continuous",
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body.regular,
    fontSize: fontSize.base,
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sortRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  sortText: {
    fontFamily: fonts.mono.regular,
    fontSize: fontSize.xxs,
    letterSpacing: letterSpacing.wide,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.body.regular,
    fontSize: fontSize.base,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
