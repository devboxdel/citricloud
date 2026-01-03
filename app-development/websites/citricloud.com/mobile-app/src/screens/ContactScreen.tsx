import { useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useColors } from '../theme/colors';

export default function ContactScreen() {
  const colors = useColors();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      Alert.alert('Success', 'Message sent successfully!');
    }, 1000);
  };

  const contactInfo = [
    {
      icon: 'mail-outline',
      title: 'Email Us',
      desc: 'support@citricloud.com',
      subtitle: 'sales@citricloud.com',
    },
    {
      icon: 'call-outline',
      title: 'Call Us',
      desc: '+1 (555) 123-4567',
      subtitle: '+44 20 7123 4567',
    },
    {
      icon: 'location-outline',
      title: 'Visit Us',
      desc: '123 Cloud Street',
      subtitle: 'San Francisco, CA 94102',
    },
    {
      icon: 'people-outline',
      title: 'Community',
      desc: 'Join our community',
      subtitle: 'Connect with others',
    },
  ];

  const otherWays = [
    {
      icon: 'chatbubbles-outline',
      title: 'Live Chat',
      desc: 'Instant help from our team',
    },
    {
      icon: 'calendar-outline',
      title: 'Schedule Call',
      desc: 'Book a consultation',
    },
    {
      icon: 'mail-outline',
      title: 'Enterprise',
      desc: 'Custom enterprise support',
    },
  ];

  return (
    <Screen>
      <SectionHeader 
        title="Get in Touch" 
        subtitle="We'd love to hear from you. Send us a message!"
      />

      {/* Contact Info Cards */}
      <View style={styles.infoGrid}>
        {contactInfo.map((info) => (
          <Card key={info.title} style={styles.infoCard}>
            <View style={[styles.infoBadge, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name={info.icon as any} size={20} color={colors.accent} />
            </View>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>{info.title}</Text>
            <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>{info.desc}</Text>
            {info.subtitle && (
              <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>{info.subtitle}</Text>
            )}
          </Card>
        ))}
      </View>

      {/* Contact Form */}
      <Card style={styles.formCard}>
        <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Send Us a Message</Text>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Name *</Text>
          <TextInput
            placeholder="Your name"
            placeholderTextColor={colors.textSecondary}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Email *</Text>
          <TextInput
            placeholder="your.email@example.com"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Subject *</Text>
          <TextInput
            placeholder="What is this about?"
            placeholderTextColor={colors.textSecondary}
            value={formData.subject}
            onChangeText={(text) => setFormData({ ...formData, subject: text })}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Message *</Text>
          <TextInput
            placeholder="Your message..."
            placeholderTextColor={colors.textSecondary}
            value={formData.message}
            onChangeText={(text) => setFormData({ ...formData, message: text })}
            multiline
            numberOfLines={6}
            style={[styles.textarea, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
          />
        </View>

        <Pressable 
          onPress={handleSubmit}
          style={[styles.submitButton, { backgroundColor: submitted ? colors.muted : colors.accent }]}
          disabled={submitted}
        >
          <Ionicons name={submitted ? 'checkmark-circle' : 'send-outline'} size={16} color={colors.background} />
          <Text style={[styles.submitButtonText, { color: colors.background }]}>
            {submitted ? 'Message Sent!' : 'Send Message'}
          </Text>
        </Pressable>
      </Card>

      {/* Other Ways Section */}
      <View style={styles.otherWaysSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Other Ways to Reach Us</Text>
        {otherWays.map((way) => (
          <Card key={way.title} style={styles.wayCard}>
            <View style={styles.wayHeader}>
              <View style={[styles.wayIcon, { backgroundColor: colors.accent + '15' }]}>
                <Ionicons name={way.icon as any} size={18} color={colors.accent} />
              </View>
              <View style={styles.wayText}>
                <Text style={[styles.wayTitle, { color: colors.textPrimary }]}>{way.title}</Text>
                <Text style={[styles.wayDesc, { color: colors.textSecondary }]}>{way.desc}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* FAQ Card */}
      <Card style={[styles.faqCard, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '30' }]}>
        <Ionicons name="help-circle-outline" size={24} color={colors.accent} style={{ marginBottom: 8 }} />
        <Text style={[styles.faqTitle, { color: colors.textPrimary }]}>Frequently Asked Questions</Text>
        <Text style={[styles.faqDesc, { color: colors.textSecondary }]}>Can't find your answer?</Text>
        <Pressable style={[styles.faqButton, { backgroundColor: colors.accent }]}>
          <Text style={[styles.faqButtonText, { color: colors.background }]}>Visit FAQ →</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    alignItems: 'center',
    textAlign: 'center',
    padding: 16,
  },
  infoBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  infoSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  formCard: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  otherWaysSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  wayCard: {
    marginBottom: 12,
  },
  wayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wayIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  wayText: {
    flex: 1,
  },
  wayTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  wayDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  faqCard: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  faqDesc: {
    fontSize: 12,
    marginBottom: 12,
  },
  faqButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  faqButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
