import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ClipboardCheck, FileText, BookOpen, LayoutDashboard, LogOut, User, CheckCircle, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAssessment } from '@/contexts/AssessmentContext';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { startNewAssessment, assessment } = useAssessment();
  const { isAuthenticated, isLoading, user, organisation, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  const handleStartNew = () => {
    startNewAssessment();
    router.push('/organisation');
  };

  const handleContinue = () => {
    router.push('/organisation');
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.replace('/auth/login');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[colors.govBlue, colors.govBlueDark]}
          style={[styles.container, styles.centered]}
        >
          <ActivityIndicator size="large" color={colors.white} />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isEmployee = user?.role === 'employee';

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[colors.govBlue, colors.govBlueDark]}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              {isEmployee ? (
                <User size={48} color={colors.white} strokeWidth={2} />
              ) : (
                <ClipboardCheck size={48} color={colors.white} strokeWidth={2} />
              )}
            </View>
            <Text style={styles.title}>Fraud Risk Assessment</Text>
            <Text style={styles.subtitle}>{isEmployee ? 'Employee Assessment' : 'Health Check'}</Text>
          </View>

          {!isEmployee && (
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                This app helps UK organisations understand their main fraud risks and create a simple action plan.
              </Text>
              <View style={styles.divider} />
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Aligned with GovS‑013 and Fraud Prevention Standard</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Creates a structured FRA report and risk register</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Usually takes 20–30 minutes to complete</Text>
              </View>
            </View>
          )}

          {isEmployee && (
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Complete your personal fraud risk assessment to help {organisation?.name || 'your organisation'} understand and manage fraud risks.
              </Text>
              <View style={styles.divider} />
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Confidential and secure assessment</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Takes approximately 15–20 minutes</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Your responses help improve organisational controls</Text>
              </View>
            </View>
          )}

          {user && (
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user.name}</Text>
              {isEmployee && user?.keyPassCode && (
                <Text style={styles.userRole}>Employee • {organisation?.name || 'Unknown'}</Text>
              )}
            </View>
          )}

          {isEmployee && assessment.status !== 'draft' && (
            <View style={styles.statusCard}>
              <View style={styles.statusIconContainer}>
                <Clock size={32} color={colors.govBlue} />
              </View>
              <Text style={styles.statusTitle}>Assessment Not Started</Text>
              <Text style={styles.statusText}>You haven&apos;t started your fraud risk assessment yet. Click below to begin.</Text>
            </View>
          )}

          {isEmployee && assessment.status === 'submitted' && (
            <View style={[styles.statusCard, styles.statusCardComplete]}>
              <View style={styles.statusIconContainer}>
                <CheckCircle size={32} color="#00703c" />
              </View>
              <Text style={styles.statusTitle}>Assessment Completed</Text>
              <Text style={styles.statusText}>Thank you for completing your assessment. Your responses have been submitted.</Text>
            </View>
          )}

          <View style={styles.buttonsContainer}>
            <Text style={styles.question}>What would you like to do today?</Text>

            {isEmployee ? (
              <>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleStartNew}
                  activeOpacity={0.8}
                >
                  <View style={styles.buttonIcon}>
                    <ClipboardCheck size={24} color={colors.govBlue} />
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonTitle}>Start My Assessment</Text>
                    <Text style={styles.buttonSubtitle}>Complete your personal fraud risk assessment</Text>
                  </View>
                </TouchableOpacity>

                {assessment.status === 'draft' && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                  >
                    <View style={styles.buttonIcon}>
                      <FileText size={24} color={colors.white} />
                    </View>
                    <View style={styles.buttonTextContainer}>
                      <Text style={styles.buttonTitleSecondary}>Continue My Assessment</Text>
                      <Text style={styles.buttonSubtitleSecondary}>Resume where you left off</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleStartNew}
                  activeOpacity={0.8}
                >
                  <View style={styles.buttonIcon}>
                    <ClipboardCheck size={24} color={colors.govBlue} />
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonTitle}>Start a new Health Check</Text>
                    <Text style={styles.buttonSubtitle}>Begin a fresh fraud risk assessment</Text>
                  </View>
                </TouchableOpacity>

                {assessment.status === 'draft' && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                  >
                    <View style={styles.buttonIcon}>
                      <FileText size={24} color={colors.white} />
                    </View>
                    <View style={styles.buttonTextContainer}>
                      <Text style={styles.buttonTitleSecondary}>Continue previous assessment</Text>
                      <Text style={styles.buttonSubtitleSecondary}>Resume your saved draft</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {organisation?.packageType === 'with-dashboard' && (
                  <TouchableOpacity
                    style={styles.dashboardButton}
                    onPress={() => router.push('/dashboard')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.buttonIcon}>
                      <LayoutDashboard size={24} color={colors.govBlue} />
                    </View>
                    <View style={styles.buttonTextContainer}>
                      <Text style={styles.buttonTitle}>Organisation Dashboard</Text>
                      <Text style={styles.buttonSubtitle}>View employee assessments & key-passes</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}

            <TouchableOpacity
              style={styles.tertiaryButton}
              activeOpacity={0.8}
            >
              <BookOpen size={20} color={colors.white} />
              <Text style={styles.tertiaryButtonText}>Learn about fraud prevention</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <LogOut size={18} color={colors.white} />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.govBlue,
  },
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '500' as const,
    color: colors.lightBlue,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.govGrey1,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.govGrey4,
    marginBottom: 16,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: colors.govBlue,
    marginRight: 8,
    fontWeight: '700' as const,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.govGrey1,
  },
  buttonsContainer: {
    gap: 16,
  },
  question: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.white,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  tertiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.govBlue,
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: colors.govGrey2,
  },
  buttonTitleSecondary: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.white,
    marginBottom: 4,
  },
  buttonSubtitleSecondary: {
    fontSize: 14,
    color: colors.lightBlue,
  },
  dashboardButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.lightBlue,
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.white,
  },
  userRole: {
    fontSize: 14,
    color: colors.lightBlue,
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  statusCardComplete: {
    borderWidth: 2,
    borderColor: '#00703c',
  },
  statusIconContainer: {
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.govGrey1,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: colors.govGrey2,
    textAlign: 'center',
    lineHeight: 20,
  },
  tertiaryButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.white,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  signOutButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.white,
    opacity: 0.8,
  },
});
