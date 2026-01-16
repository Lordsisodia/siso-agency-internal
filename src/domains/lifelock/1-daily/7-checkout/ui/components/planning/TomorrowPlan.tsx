import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { motify } from 'moti';
import { useThemeColor } from '../../../../../../hooks/useThemeColor';

const MotiView = motify(View)();
const MotiText = motify(Text)();

interface TomorrowPlanProps {
  nonNegotiable: string;
  topTasks: [string, string, string];
  tomorrowFocus: string;
  onChange: (updates: {
    nonNegotiable?: string;
    topTasks?: [string, string, string];
    tomorrowFocus?: string;
  }) => void;
}

export const TomorrowPlan: React.FC<TomorrowPlanProps> = ({
  nonNegotiable,
  topTasks,
  tomorrowFocus,
  onChange,
}) => {
  const purple = useThemeColor('purple');
  const purpleLight = useThemeColor('purpleLight');
  const accent = useThemeColor('accent');
  const text = useThemeColor('text');
  const textSecondary = useThemeColor('textSecondary');
  const card = useThemeColor('card');
  const border = useThemeColor('border');

  const [localNonNegotiable, setLocalNonNegotiable] = useState(nonNegotiable);
  const [localTopTasks, setLocalTopTasks] = useState(topTasks);
  const [localTomorrowFocus, setLocalTomorrowFocus] = useState(tomorrowFocus);

  useEffect(() => {
    setLocalNonNegotiable(nonNegotiable);
  }, [nonNegotiable]);

  useEffect(() => {
    setLocalTopTasks(topTasks);
  }, [topTasks]);

  useEffect(() => {
    setLocalTomorrowFocus(tomorrowFocus);
  }, [tomorrowFocus]);

  const handleNonNegotiableChange = (value: string) => {
    setLocalNonNegotiable(value);
    onChange({ nonNegotiable: value });
  };

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...localTopTasks] as [string, string, string];
    newTasks[index] = value;
    setLocalTopTasks(newTasks);
    onChange({ topTasks: newTasks });
  };

  const handleFocusChange = (value: string) => {
    setLocalTomorrowFocus(value);
    onChange({ tomorrowFocus: value });
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 100 }}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="calendar-outline" size={24} color={purple} />
        </View>
        <View style={styles.headerText}>
          <MotiText style={[styles.title, { color: text }]}>
            Tomorrow's Plan
          </MotiText>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            Set yourself up for success
          </Text>
        </View>
      </View>

      {/* Non-Negotiable Task - Hero Section */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 200 }}
        style={[
          styles.nonNegotiableContainer,
          { backgroundColor: card, borderColor: accent, borderWidth: 2 },
        ]}
      >
        <View style={styles.nonNegotiableHeader}>
          <Ionicons name="flame" size={28} color="#FF6B6B" />
          <Text style={[styles.nonNegotiableLabel, { color: text }]}>
            Non-Negotiable
          </Text>
        </View>
        <TextInput
          style={[
            styles.nonNegotiableInput,
            {
              color: text,
              backgroundColor: purpleLight,
            },
          ]}
          placeholder="The ONE thing that must happen tomorrow..."
          placeholderTextColor={textSecondary}
          value={localNonNegotiable}
          onChangeText={handleNonNegotiableChange}
          multiline
          numberOfLines={2}
          maxLength={200}
        />
      </MotiView>

      {/* Top 3 Tasks */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 300 }}
      >
        <Text style={[styles.sectionTitle, { color: text }]}>
          Top 3 Tasks
        </Text>
        <View style={styles.tasksContainer}>
          {[0, 1, 2].map((index, i) => (
            <MotiView
              key={index}
              from={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 400 + i * 100 }}
              style={[
                styles.taskItem,
                { backgroundColor: card, borderColor: border },
              ]}
            >
              <View style={styles.taskNumber}>
                <Text style={[styles.taskNumberText, { color: purple }]}>
                  #{index + 1}
                </Text>
              </View>
              <TextInput
                style={[
                  styles.taskInput,
                  { color: text },
                ]}
                placeholder={
                  index === 0
                    ? 'First priority...'
                    : index === 1
                    ? 'Second priority...'
                    : 'Third priority...'
                }
                placeholderTextColor={textSecondary}
                value={localTopTasks[index]}
                onChangeText={(value) => handleTaskChange(index, value)}
                multiline
              />
              <View style={styles.dragHandle}>
                <Ionicons name="reorder-two-outline" size={20} color={textSecondary} />
              </View>
            </MotiView>
          ))}
        </View>
      </MotiView>

      {/* Tomorrow's Focus */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 700 }}
        style={[
          styles.focusContainer,
          { backgroundColor: card, borderColor: border },
        ]}
      >
        <View style={styles.focusHeader}>
          <Ionicons name="bulb" size={24} color={purple} />
          <Text style={[styles.focusLabel, { color: text }]}>
            Tomorrow's Focus
          </Text>
        </View>
        <TextInput
          style={[
            styles.focusInput,
            { color: text, backgroundColor: purpleLight },
          ]}
          placeholder="What's your main focus for tomorrow? e.g., 'Ship the feature cleanly, then celebrate'"
          placeholderTextColor={textSecondary}
          value={localTomorrowFocus}
          onChangeText={handleFocusChange}
          multiline
          numberOfLines={3}
          maxLength={200}
        />
        <View style={styles.charCounter}>
          <Text style={[styles.charCounterText, { color: textSecondary }]}>
            {localTomorrowFocus.length}/200
          </Text>
        </View>
      </MotiView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  nonNegotiableContainer: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nonNegotiableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  nonNegotiableLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  nonNegotiableInput: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    padding: 16,
    borderRadius: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  tasksContainer: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  taskNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskNumberText: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    minHeight: 44,
    textAlignVertical: 'center',
  },
  dragHandle: {
    padding: 4,
  },
  focusContainer: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  focusLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  focusInput: {
    fontSize: 16,
    lineHeight: 22,
    padding: 16,
    borderRadius: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCounter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  charCounterText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
