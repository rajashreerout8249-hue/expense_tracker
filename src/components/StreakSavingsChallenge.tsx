import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '@expo/vector-icons/Ionicons';

import { useExpense } from '../context/ExpenseContext';
import { colors } from '../theme';

type Challenge = {
  id: string;
  title: string;
  target: number;
  days: number;
};

const CHALLENGES: Challenge[] = [
  {
    id: 'save-500',
    title: 'Save ₹500',
    target: 500,
    days: 7,
  },
  {
    id: 'save-1000',
    title: 'Save ₹1,000',
    target: 1000,
    days: 14,
  },
  {
    id: 'save-2500',
    title: 'Save ₹2,500',
    target: 2500,
    days: 30,
  },
];

export default function StreakSavingsChallenge() {
  const { transactions } = useExpense();

  const [selectedChallenge, setSelectedChallenge] =
    useState<Challenge>(CHALLENGES[0]);

  const [savedAmount, setSavedAmount] = useState(0);

  const [challengeStarted, setChallengeStarted] =
    useState(false);

  const [streak, setStreak] = useState(0);

  const progressAnimation = useRef(
    new Animated.Value(0)
  ).current;

  const streakScale = useRef(
    new Animated.Value(1)
  ).current;

  const cardOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const cardTranslate = useRef(
    new Animated.Value(25)
  ).current;

  // =====================================================
  // LOAD SAVED DATA
  // =====================================================

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    try {
      const savedChallenge =
        await AsyncStorage.getItem(
          '@expense_challenge'
        );

      if (savedChallenge) {
        const data = JSON.parse(savedChallenge);

        if (data.challengeId) {
          const found =
            CHALLENGES.find(
              item =>
                item.id === data.challengeId
            );

          if (found) {
            setSelectedChallenge(found);
          }
        }

        setSavedAmount(
          Number(data.savedAmount || 0)
        );

        setChallengeStarted(
          Boolean(data.started)
        );
      }
    } catch (error) {
      console.log(
        'Challenge load error:',
        error
      );
    }
  };

  // =====================================================
  // CARD ANIMATION
  // =====================================================

  useEffect(() => {
    Animated.parallel([
      Animated.timing(
        cardOpacity,
        {
          toValue: 1,
          duration: 650,
          easing: Easing.out(
            Easing.cubic
          ),
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        cardTranslate,
        {
          toValue: 0,
          duration: 650,
          easing: Easing.out(
            Easing.cubic
          ),
          useNativeDriver: true,
        }
      ),
    ]).start();
  }, []);

  // =====================================================
  // EXPENSE STREAK CALCULATION
  // =====================================================

  useEffect(() => {
    calculateStreak();
  }, [transactions]);

  const calculateStreak = () => {
    const expenses = transactions.filter(
      transaction =>
        transaction.type === 'expense'
    );

    if (expenses.length === 0) {
      setStreak(0);
      return;
    }

    const dailyLimit = 1000;

    const dailyTotals: {
      [key: string]: number;
    } = {};

    expenses.forEach(transaction => {
      const date = String(
        transaction.date || ''
      ).split('T')[0];

      if (!date) return;

      dailyTotals[date] =
        (dailyTotals[date] || 0) +
        Number(transaction.amount || 0);
    });

    const today = new Date();

    let currentStreak = 0;

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);

      date.setDate(
        today.getDate() - i
      );

      const key = date
        .toISOString()
        .split('T')[0];

      const amount =
        dailyTotals[key] || 0;

      if (
        amount > 0 &&
        amount <= dailyLimit
      ) {
        currentStreak++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  // =====================================================
  // STREAK ANIMATION
  // =====================================================

  useEffect(() => {
    if (streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            streakScale,
            {
              toValue: 1.08,
              duration: 700,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            streakScale,
            {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }
          ),
        ])
      ).start();
    }
  }, [streak]);

  // =====================================================
  // CHALLENGE PROGRESS
  // =====================================================

  const progress = useMemo(() => {
    if (
      selectedChallenge.target <= 0
    ) {
      return 0;
    }

    return Math.min(
      savedAmount /
        selectedChallenge.target,
      1
    );
  }, [
    savedAmount,
    selectedChallenge,
  ]);

  useEffect(() => {
    Animated.timing(
      progressAnimation,
      {
        toValue: progress,
        duration: 900,
        easing: Easing.out(
          Easing.cubic
        ),
        useNativeDriver: false,
      }
    ).start();
  }, [progress]);

  // =====================================================
  // START CHALLENGE
  // =====================================================

  const startChallenge = async () => {
    try {
      const data = {
        challengeId:
          selectedChallenge.id,
        savedAmount: 0,
        started: true,
      };

      await AsyncStorage.setItem(
        '@expense_challenge',
        JSON.stringify(data)
      );

      setSavedAmount(0);
      setChallengeStarted(true);

      Animated.sequence([
        Animated.timing(
          streakScale,
          {
            toValue: 1.15,
            duration: 180,
            useNativeDriver: true,
          }
        ),

        Animated.spring(
          streakScale,
          {
            toValue: 1,
            useNativeDriver: true,
          }
        ),
      ]).start();
    } catch (error) {
      console.log(
        'Challenge start error:',
        error
      );
    }
  };

  // =====================================================
  // ADD SAVING
  // =====================================================

  const addSaving = async (
    amount: number
  ) => {
    try {
      const newAmount = Math.min(
        savedAmount + amount,
        selectedChallenge.target
      );

      setSavedAmount(newAmount);

      await AsyncStorage.setItem(
        '@expense_challenge',
        JSON.stringify({
          challengeId:
            selectedChallenge.id,
          savedAmount: newAmount,
          started: true,
        })
      );

      Animated.sequence([
        Animated.timing(
          streakScale,
          {
            toValue: 1.12,
            duration: 180,
            useNativeDriver: true,
          }
        ),

        Animated.spring(
          streakScale,
          {
            toValue: 1,
            useNativeDriver: true,
          },
        ),
      ]).start();
    } catch (error) {
      console.log(
        'Saving update error:',
        error
      );
    }
  };

  // =====================================================
  // CHANGE CHALLENGE
  // =====================================================

  const changeChallenge = async (
    challenge: Challenge
  ) => {
    setSelectedChallenge(challenge);
    setSavedAmount(0);
    setChallengeStarted(false);

    await AsyncStorage.setItem(
      '@expense_challenge',
      JSON.stringify({
        challengeId: challenge.id,
        savedAmount: 0,
        started: false,
      })
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: cardOpacity,
          transform: [
            {
              translateY: cardTranslate,
            },
          ],
        },
      ]}
    >
      {/* ================= STREAK ================= */}

      <View style={styles.streakCard}>
        <View style={styles.glowCircle} />

        <View style={styles.streakTop}>
          <View>
            <Text style={styles.smallLabel}>
              EXPENSE STREAK
            </Text>

            <Text style={styles.streakTitle}>
              Stay on track 🔥
            </Text>
          </View>

          <Animated.View
            style={[
              styles.fireIcon,
              {
                transform: [
                  {
                    scale: streakScale,
                  },
                ],
              },
            ]}
          >
            <Text style={styles.fireEmoji}>
              🔥
            </Text>
          </Animated.View>
        </View>

        <View style={styles.streakNumberRow}>
          <Text style={styles.streakNumber}>
            {streak}
          </Text>

          <View>
            <Text style={styles.daysText}>
              DAYS
            </Text>

            <Text style={styles.streakMessage}>
              {streak === 0
                ? 'Start your first streak'
                : streak === 1
                ? 'Great start!'
                : streak < 7
                ? 'Keep going!'
                : 'Amazing discipline!'}
            </Text>
          </View>
        </View>

        <View style={styles.streakBar}>
          <View
            style={[
              styles.streakBarFill,
              {
                width: `${Math.min(
                  streak * 14.28,
                  100
                )}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.streakHint}>
          Keep daily spending under ₹1,000
          to continue your streak.
        </Text>
      </View>

      {/* ================= SAVINGS ================= */}

      <View style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <View>
            <Text style={styles.smallLabel}>
              SAVINGS CHALLENGE
            </Text>

            <Text style={styles.challengeTitle}>
              {selectedChallenge.title}
            </Text>
          </View>

          <View style={styles.trophyCircle}>
            <Icon
              name="trophy-outline"
              size={24}
              color="#FFD166"
            />
          </View>
        </View>

        {/* Challenge selector */}

        <View style={styles.challengeOptions}>
          {CHALLENGES.map(
            challenge => {
              const active =
                challenge.id ===
                selectedChallenge.id;

              return (
                <TouchableOpacity
                  key={challenge.id}
                  activeOpacity={0.8}
                  style={[
                    styles.challengeOption,
                    active &&
                      styles.challengeOptionActive,
                  ]}
                  onPress={() =>
                    changeChallenge(
                      challenge
                    )
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      active &&
                        styles.optionTextActive,
                    ]}
                  >
                    ₹{challenge.target}
                  </Text>

                  <Text
                    style={[
                      styles.optionDays,
                      active &&
                        styles.optionDaysActive,
                    ]}
                  >
                    {challenge.days}d
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* Progress */}

        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            Progress
          </Text>

          <Text style={styles.progressAmount}>
            ₹{savedAmount} / ₹
            {selectedChallenge.target}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width:
                  progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      '0%',
                      '100%',
                    ],
                  }),
              },
            ]}
          />
        </View>

        <Text style={styles.progressPercent}>
          {Math.round(progress * 100)}%
          completed
        </Text>

        {/* Buttons */}

        {!challengeStarted ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.startButton}
            onPress={startChallenge}
          >
            <Icon
              name="rocket-outline"
              size={20}
              color="#07110C"
            />

            <Text style={styles.startButtonText}>
              Start Challenge
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.savingButtons}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.saveButton}
              onPress={() =>
                addSaving(50)
              }
            >
              <Text style={styles.saveButtonText}>
                + ₹50
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.saveButton}
              onPress={() =>
                addSaving(100)
              }
            >
              <Text style={styles.saveButtonText}>
                + ₹100
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.saveButton}
              onPress={() =>
                addSaving(250)
              }
            >
              <Text style={styles.saveButtonText}>
                + ₹250
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {progress >= 1 && (
          <Animated.View
            style={[
              styles.completedBox,
              {
                transform: [
                  {
                    scale: streakScale,
                  },
                ],
              },
            ]}
          >
            <Text style={styles.completedEmoji}>
              🎉
            </Text>

            <View>
              <Text style={styles.completedTitle}>
                Challenge Completed!
              </Text>

              <Text style={styles.completedText}>
                Amazing! You reached your
                savings goal.
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },

  streakCard: {
    backgroundColor: '#151B2A',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252E42',
  },

  glowCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FF8A3D',
    opacity: 0.08,
    right: -50,
    top: -55,
  },

  streakTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7F8AA3',
    letterSpacing: 1.2,
  },

  streakTitle: {
    marginTop: 5,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  fireIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2A2020',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fireEmoji: {
    fontSize: 29,
  },

  streakNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },

  streakNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FF9F43',
    marginRight: 12,
  },

  daysText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  streakMessage: {
    marginTop: 3,
    fontSize: 12,
    color: '#8E99AE',
  },

  streakBar: {
    height: 8,
    borderRadius: 8,
    backgroundColor: '#252D3D',
    marginTop: 18,
    overflow: 'hidden',
  },

  streakBarFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#FF9F43',
  },

  streakHint: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: '#8994AA',
  },

  challengeCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#252E42',
  },

  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  challengeTitle: {
    marginTop: 5,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },

  trophyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#302A19',
    alignItems: 'center',
    justifyContent: 'center',
  },

  challengeOptions: {
    flexDirection: 'row',
    marginTop: 18,
  },

  challengeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.background,
    marginRight: 7,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252E42',
  },

  challengeOptionActive: {
    borderColor: '#4ADE80',
    backgroundColor: '#123021',
  },

  optionText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
  },

  optionTextActive: {
    color: '#4ADE80',
  },

  optionDays: {
    fontSize: 10,
    marginTop: 3,
    color: colors.textSecondary,
  },

  optionDaysActive: {
    color: '#8FF0B0',
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 9,
  },

  progressLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  progressAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },

  progressTrack: {
    height: 12,
    borderRadius: 12,
    backgroundColor: '#252D3D',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#4ADE80',
  },

  progressPercent: {
    textAlign: 'right',
    marginTop: 7,
    fontSize: 11,
    color: colors.textSecondary,
  },

  startButton: {
    marginTop: 18,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#4ADE80',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  startButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '900',
    color: '#07110C',
  },

  savingButtons: {
    flexDirection: 'row',
    marginTop: 18,
  },

  saveButton: {
    flex: 1,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#16261D',
    borderWidth: 1,
    borderColor: '#2C6D45',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  saveButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4ADE80',
  },

  completedBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#14291C',
    borderWidth: 1,
    borderColor: '#2D7548',
    flexDirection: 'row',
    alignItems: 'center',
  },

  completedEmoji: {
    fontSize: 28,
    marginRight: 12,
  },

  completedTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#4ADE80',
  },

  completedText: {
    marginTop: 3,
    fontSize: 11,
    color: '#91B59D',
  },
});