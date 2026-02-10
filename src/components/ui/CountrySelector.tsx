import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, Button, Card } from './index';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { useCountry } from '../../context/CountryContext';
import { COUNTRIES } from '../../config/countries';
import { useTranslation } from '../../hooks/useTranslation';

interface CountrySelectorProps {
  showLabel?: boolean;
  compact?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  showLabel = true,
  compact = false
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentCountry, countryCode, setCountry } = useCountry();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const handleCountryChange = (newCountryCode: string) => {
    Alert.alert(
      t('countrySelector.changeTitle'),
      t('countrySelector.changeMessage', { country: COUNTRIES[newCountryCode].name }),
      [
        { 
          text: t('countrySelector.cancel'),
          style: 'cancel' 
        },
        {
          text: t('countrySelector.confirm'),
          onPress: () => {
            setCountry(newCountryCode);
            setShowModal(false);
          }
        }
      ]
    );
  };

  const getCountryFlag = (code: string) => {
    switch (code) {
      case 'TR': return '🇹🇷';
      case 'UK': return '🇬🇧';
      default: return '🌍';
    }
  };

  if (compact) {
    return (
      <>
        <TouchableOpacity
          onPress={() => {
            console.log('🇹🇷 Country selector pressed, opening modal...');
            setShowModal(true);
          }}
          style={[styles.compactButton, { borderColor: colors.border }]}
        >
          <Text style={styles.flagText}>{getCountryFlag(countryCode)}</Text>
          <Text variant="caption" color="textSecondary">
            {currentCountry.currencySymbol}
          </Text>
        </TouchableOpacity>
        
        {/* Modal - Compact mode için de göster */}
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text variant="heading" weight="bold">
                  {t('countrySelector.selectTitle')}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {Object.entries(COUNTRIES).map(([code, country]) => (
                <TouchableOpacity
                  key={code}
                  onPress={() => handleCountryChange(code)}
                  style={[
                    styles.countryOption,
                    {
                      backgroundColor: code === countryCode ? colors.primary + '20' : 'transparent',
                      borderColor: colors.border
                    }
                  ]}
                >
                  <Text style={styles.flagText}>{getCountryFlag(code)}</Text>
                  <View style={styles.countryDetails}>
                    <Text variant="body" weight="medium">
                      {country.name}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      {country.currency} • {country.language.toUpperCase()}
                    </Text>
                    {country.businessCompliance.required && (
                      <Text variant="caption" color="warning">
                        ⚠️ {t('countrySelector.businessComplianceRequired')}
                      </Text>
                    )}
                  </View>
                  {code === countryCode && (
                    <MaterialIcons name="check" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text variant="body" weight="medium" style={styles.label}>
          {t('countrySelector.label')}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={[styles.selector, { 
          backgroundColor: colors.surface,
          borderColor: colors.border 
        }]}
      >
        <View style={styles.selectedCountry}>
          <Text style={styles.flagText}>{getCountryFlag(countryCode)}</Text>
          <View style={styles.countryInfo}>
            <Text variant="body" weight="medium">
              {currentCountry.name}
            </Text>
            <Text variant="caption" color="textSecondary">
              {currentCountry.currency} • {currentCountry.language.toUpperCase()}
            </Text>
          </View>
        </View>
        <MaterialIcons name="chevron-down" size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text variant="heading" weight="bold">
                {t('countrySelector.selectTitle')}
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {Object.entries(COUNTRIES).map(([code, country]) => (
              <TouchableOpacity
                key={code}
                onPress={() => handleCountryChange(code)}
                style={[
                  styles.countryOption,
                  {
                    backgroundColor: code === countryCode ? colors.primary + '20' : 'transparent',
                    borderColor: colors.border
                  }
                ]}
              >
                <Text style={styles.flagText}>{getCountryFlag(code)}</Text>
                <View style={styles.countryDetails}>
                  <Text variant="body" weight="medium">
                    {country.name}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {country.currency} • {country.language.toUpperCase()}
                  </Text>
                  {country.businessCompliance.required && (
                    <Text variant="caption" color="warning">
                      ⚠️ {t('countrySelector.businessComplianceRequired')}
                    </Text>
                  )}
                </View>
                {code === countryCode && (
                  <MaterialIcons name="check" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedCountry: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  countryInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  flagText: {
    fontSize: 24,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  countryDetails: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
});
