import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { motify } from 'moti';
import { useThemeColor } from '../../../../../../hooks/useThemeColor';

const MotiView = motify(View)();

interface AccountabilityCardProps {
  yesterdayFocus: string;
  yesterdayDate: string;
}

export const AccountabilityCard: React.FC<AccountabilityCardProps> = ({
  yesterdayFocus,
  yesterdayDate,
}) => {
  const text = useThemeColor('text');
  const textSecondary = useThemeColor('textSecondary');
  const card = useThemeColor('card');
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  const handleYes = () => {
    setFeedback('yes');
  };

  const handleNo = () => {
    setFeedback('no');
  };

  if (!yesterdayFocus) {
    return null;
  }

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 200, type: 'spring', damping: 20 }}
      style={[
        styles.container,
        {
          backgroundColor: 'rgba(251, 191, 36, 0.08)',
          borderColor: '#FBBF24',
          borderWidth: 2,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(251, 191, 36, 0.2)' }]}>
          <Ionicons name="trending-up" size={28} color="#FBBF24" />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: text }]}>
            Yesterday you said you'd focus on:
          </Text>
          <Text style={[styles.date, { color: textSecondary }]}>
            {yesterdayDate}
          </Text>
        </View>
      </View>

      {/* Quote Display */}
      <View style={[styles.quoteContainer, { borderColor: '#FBBF24', borderWidth: 1 }]}>
        <Ionicons name="quote" size={32} color="#FBBF24" style={styles.quoteIcon} />
        <Text style={[styles.quoteText, { color: text }]}>
          {yesterdayFocus}
        </Text>
        <Ionicons
          name="quote"
          size={32}
          color="#FBBF24"
          style={[styles.quoteIcon, styles.quoteIconEnd]}
        />
      </View>

      {/* Call to Action */}
      <View style={styles.ctaContainer}>
        <Text style={[styles.ctaTitle, { color: text }]}>
          Did you follow through?
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              feedback === 'yes' && styles.buttonYes,
              feedback === 'yes' && { backgroundColor: '#10B981' },
              { backgroundColor: feedback === 'yes' ? '#10B981' : 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' },
            ]}
            onPress={handleYes}
            activeOpacity={0.7}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={feedback === 'yes' ? '#FFFFFF' : '#10B981'}
            />
            <Text
              style={[
                styles.buttonText,
                { color: feedback === 'yes' ? '#FFFFFF' : '#10B981' },
              ]}
            >
              Yes, nailed it! 🎯
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              feedback === 'no' && styles.buttonNo,
              { backgroundColor: feedback === 'no' ? 'rgba(147, 51, 234, 1)' : 'rgba(147, 51, 234, 0.1)', borderColor: '#9333EA' },
            ]}
            onPress={handleNo}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-forward-circle"
              size={20}
              color={feedback === 'no' ? '#FFFFFF' : '#9333EA'}
            />
            <Text
              style={[
                styles.buttonText,
                { color: feedback === 'no' ? '#FFFFFF' : '#9333EA' },
              ]}
            >
              No, tomorrow 👊
            </Text>
          </TouchableOpacity>
        </View>

        {feedback === 'yes' && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.feedbackMessage}
          >
            <Text style={[styles.feedbackText, { color: '#10B981' }]}>
              Great job! Keep the momentum going!
            </Text>
          </MotiView>
        )}

        {feedback === 'no' && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.feedbackMessage}
          >
            <Text style={[styles.feedbackText, { color: textSecondary }]}>
              No worries! Tomorrow is a fresh start. 💪
            </Text>
          </MotiView>
        )}
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  date: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  quoteContainer: {
    borderRadius: 12,
    padding: 20,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  quoteIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
    opacity: 0.3,
  },
  quoteIconEnd: {
    left: undefined,
    right: 8,
    top: undefined,
    bottom: 8,
    transform: [{ rotate: '180deg' }],
  },
  quoteText: {
    fontSize: 20,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 28,
    textAlign: 'center',
    paddingHorizontal: 24,
    letterSpacing: -0.3,
  },
  ctaContainer: {
    gap: 12,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  buttonYes: {
    // Styles applied dynamically
  },
  buttonNo: {
    // Styles applied dynamically
  },
  feedbackMessage: {
    alignItems: 'center',
    marginTop: 4,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
