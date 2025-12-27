import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAssessment } from '@/contexts/AssessmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Users } from 'lucide-react-native';
import colors from '@/constants/colors';
import type { PackageType, EmployeeCount, OrganisationSize } from '@/types/assessment';

interface PackageOption {
  id: PackageType;
  name: string;
  price: number;
  description: string;
  features: string[];
  keyPasses: number;
  popular?: boolean;
  recommended?: boolean;
  recommendedFor?: string;
}

function getOrganisationSize(employeeCount: EmployeeCount | null): OrganisationSize {
  if (!employeeCount) return 'small';
  if (employeeCount === '1-10' || employeeCount === '11-50' || employeeCount === '51-100') return 'small';
  if (employeeCount === '101-250') return 'medium';
  return 'large';
}

export default function PackagesScreen() {
  const router = useRouter();
  const { assessment, selectPackage } = useAssessment();
  const { allocateKeyPasses } = useAuth();
  
  const orgSize = useMemo(() => 
    getOrganisationSize(assessment.organisation.employeeCount),
    [assessment.organisation.employeeCount]
  );

  const packages: PackageOption[] = useMemo(() => [
    {
      id: 'health-check',
      name: 'Health Check FRA',
      price: 1500,
      description: 'Complete fraud risk assessment with actionable report',
      features: [
        'Standardised FRA report',
        'Risk register with priorities',
        'Action plan (0-3, 3-6, 6-12 months)',
        'GovS-013 compliance summary',
      ],
      keyPasses: orgSize === 'small' ? 100 : 250,
      recommended: orgSize === 'small',
      recommendedFor: 'organisations with up to 100 employees',
    },
    {
      id: 'with-awareness',
      name: 'FRA + Awareness Briefing',
      price: 2200,
      description: 'Everything in Health Check plus staff awareness materials',
      features: [
        'Everything in Health Check',
        'Awareness slide deck',
        '30-minute workshop outline',
        'Staff communication templates',
      ],
      keyPasses: orgSize === 'small' ? 100 : 250,
      popular: orgSize === 'medium',
      recommended: orgSize === 'medium',
      recommendedFor: 'organisations with 100-250 employees',
    },
    {
      id: 'with-dashboard',
      name: 'FRA + Dashboard (12 months)',
      price: 3200,
      description: 'Complete package with ongoing quarterly monitoring and employee access',
      features: [
        'Everything in Awareness package',
        'Quarterly prevention dashboard',
        '12 months of monitoring',
        'Trend analysis and updates',
        'Employee usage tracking',
      ],
      keyPasses: 250,
      popular: orgSize === 'large',
      recommended: orgSize === 'large',
      recommendedFor: 'organisations with more than 250 employees',
    },
  ], [orgSize]);

  const handleSelectPackage = async (pkg: PackageOption) => {
    selectPackage(pkg.id, pkg.price);
    await allocateKeyPasses(pkg.id, assessment.organisation.employeeCount);
    router.push('/payment');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Choose your FRA package</Text>
        <Text style={styles.subtitle}>
          Select the package that best fits your organisation&apos;s needs
        </Text>

        <View style={styles.packagesContainer}>
          {packages.map((pkg) => (
            <View key={pkg.id} style={[styles.packageCard, pkg.recommended && styles.packageCardRecommended]}>
              {pkg.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}
              {pkg.popular && !pkg.recommended && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}
              <View style={styles.packageHeader}>
                <Text style={styles.packageName}>{pkg.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceSymbol}>£</Text>
                  <Text style={styles.priceAmount}>{pkg.price.toLocaleString()}</Text>
                </View>
                <Text style={styles.priceNote}>+ VAT if applicable</Text>
              </View>

              <Text style={styles.packageDescription}>{pkg.description}</Text>

              {pkg.recommendedFor && pkg.recommended && (
                <View style={styles.recommendedNote}>
                  <Text style={styles.recommendedNoteText}>Best for {pkg.recommendedFor}</Text>
                </View>
              )}

              <View style={styles.featuresContainer}>
                {pkg.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <View style={styles.checkIcon}>
                      <Check size={16} color={colors.white} strokeWidth={3} />
                    </View>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.keyPassInfo}>
                <Users size={18} color={colors.govBlue} />
                <Text style={styles.keyPassText}>
                  Includes up to <Text style={styles.keyPassNumber}>{pkg.keyPasses}</Text> employee access passes
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.selectButton, pkg.recommended && styles.selectButtonRecommended]}
                onPress={() => handleSelectPackage(pkg)}
                activeOpacity={0.8}
              >
                <Text style={[styles.selectButtonText, pkg.recommended && styles.selectButtonTextRecommended]}>
                  Select Package
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            All packages include a comprehensive fraud risk assessment aligned with GovS‑013 and the Fraud Prevention Standard.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.govGrey4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  intro: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.govGrey1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.govGrey2,
    marginBottom: 24,
  },
  packagesContainer: {
    gap: 16,
  },
  packageCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.govGrey3,
    position: 'relative' as const,
  },
  packageCardRecommended: {
    borderColor: colors.govBlue,
    borderWidth: 3,
    backgroundColor: colors.lightBlue,
  },
  popularBadge: {
    position: 'absolute' as const,
    top: -10,
    right: 20,
    backgroundColor: colors.govGreen,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.white,
    textTransform: 'uppercase' as const,
  },
  recommendedBadge: {
    position: 'absolute' as const,
    top: -10,
    right: 20,
    backgroundColor: colors.govBlue,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.white,
    textTransform: 'uppercase' as const,
  },
  recommendedNote: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.govBlue,
  },
  recommendedNoteText: {
    fontSize: 14,
    color: colors.govBlue,
    fontWeight: '600' as const,
  },
  packageHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.govGrey4,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.govGrey1,
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  priceSymbol: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.govBlue,
    marginTop: 4,
  },
  priceAmount: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: colors.govBlue,
  },
  priceNote: {
    fontSize: 12,
    color: colors.govGrey2,
  },
  packageDescription: {
    fontSize: 15,
    color: colors.govGrey2,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  featuresContainer: {
    marginBottom: 20,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.govGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: colors.govGrey1,
    lineHeight: 20,
  },
  keyPassInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    gap: 8,
  },
  keyPassText: {
    flex: 1,
    fontSize: 13,
    color: colors.govGrey1,
  },
  keyPassNumber: {
    fontWeight: '700' as const,
    color: colors.govBlue,
  },
  selectButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.govBlue,
    borderRadius: 4,
    padding: 14,
    alignItems: 'center',
  },
  selectButtonRecommended: {
    backgroundColor: colors.govBlue,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.govBlue,
  },
  selectButtonTextRecommended: {
    color: colors.white,
  },
  infoBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.lightBlue,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.govGrey2,
    lineHeight: 18,
    textAlign: 'center' as const,
  },
});
