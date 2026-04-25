import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableWithoutFeedback, BackHandler } from 'react-native';
import { Portal, Text, IconButton, Button, Divider } from 'react-native-paper';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';
import { ResourceCard } from './ResourceCard';
import { FieldResource } from '../../types/resources';
import { useLanguageStore } from '../../store/useLanguageStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onDismiss: () => void;
  resources: FieldResource[];
  fieldName: string;
  onAddTransaction: (resourceTypeId?: string) => void;
  onViewResource: (resource: FieldResource) => void;
}

export const FieldResourcesBottomSheet: React.FC<Props> = ({ 
  visible, 
  onDismiss, 
  resources, 
  fieldName,
  onAddTransaction,
  onViewResource
}) => {
  const { t } = useLanguageStore();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      if (visible) {
        onDismiss();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [visible, onDismiss]);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible && opacity.value === 0) return null;

  return (
    <Portal>
      <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onDismiss}>
          <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet */}
        <Animated.View style={[styles.sheet, animatedSheetStyle]}>
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>{fieldName}</Text>
                <Text style={styles.subtitle}>Inventory Management</Text>
              </View>
              <IconButton 
                icon="close" 
                size={20} 
                onPress={onDismiss} 
                style={styles.closeBtn} 
                iconColor="#000"
              />
            </View>
          </View>

          <Divider style={styles.divider} />

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {resources.length > 0 ? (
              resources.map((res) => (
                <ResourceCard 
                  key={res.id} 
                  resource={res} 
                  onAddPress={() => onAddTransaction(res.resource_type_id)}
                  onPress={() => onViewResource(res)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No active resources for this field.</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button 
              mode="contained" 
              onPress={() => onAddTransaction()} 
              style={styles.addBtn}
              icon="plus"
              contentStyle={styles.addBtnContent}
              labelStyle={styles.addBtnLabel}
            >
            RECORD TRANSACTION
          </Button>
          </View>
        </Animated.View>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    height: SCREEN_HEIGHT * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: '#F8F8F8',
    margin: 0,
  },
  divider: {
    backgroundColor: '#F0F0F0',
    height: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  emptyState: {
    padding: 80,
    alignItems: 'center',
  },
  emptyText: {
    color: '#AAA',
    fontStyle: 'italic',
    fontSize: 15,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 34, // Extra padding for bottom home indicator on iOS
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  addBtn: {
    backgroundColor: '#000',
    borderRadius: 18,
    elevation: 0,
  },
  addBtnContent: {
    height: 60,
  },
  addBtnLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
