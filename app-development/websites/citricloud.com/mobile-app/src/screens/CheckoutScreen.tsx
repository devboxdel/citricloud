import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/colors';
import { Card } from '../components/Card';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { erpAPI } from '../lib/api';

export default function CheckoutScreen({ navigation }: any) {
  const colors = useColors();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: user?.full_name?.split(' ')[0] || '',
    lastName: user?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    address: (user as any)?.address || '',
    city: (user as any)?.city || '',
    country: (user as any)?.country || '',
    zipCode: (user as any)?.zip_code || '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please log in to complete your purchase.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
          { text: 'Login', onPress: () => navigation.navigate('Account') }
        ]
      );
    }
  }, [isAuthenticated, navigation]);

  const total = getTotal();
  const tax = total * 0.1;
  const grandTotal = total + tax;

  const update = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to complete your purchase.');
      navigation.navigate('Account');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Cart Empty', 'Please add items before checkout.');
      return;
    }
    if (!form.firstName || !form.lastName || !form.email || !form.address) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      // Simulate payment processing delay
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));

      const orderData = {
        items: items.map((it) => ({ product_id: it.id, quantity: it.quantity })),
        shipping_address: {
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          address: form.address,
          city: form.city,
          country: form.country,
          zip_code: form.zipCode,
        },
        billing_address: {
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          address: form.address,
          city: form.city,
          country: form.country,
          zip_code: form.zipCode,
        },
        notes: 'Checkout via mobile',
      };

      const order = await erpAPI.createOrder(orderData);
      clearCart();
      Alert.alert('Thank you!', `Order ${order.order_number || order.id} created successfully.`, [
        { text: 'OK', onPress: () => { navigation.goBack(); } },
      ]);
    } catch (e: any) {
      let msg = e?.response?.data?.detail || e?.message || 'Failed to process your order. Please try again.';
      if (e?.response?.status === 401) {
        msg = 'Authentication required. Please log in and try again.';
        Alert.alert('Login Required', msg, [
          { text: 'OK', onPress: () => navigation.navigate('Account') }
        ]);
      } else {
        setError(msg);
        Alert.alert('Order Failed', msg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => navigation?.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {error && (
            <Card style={[styles.alert, { borderColor: colors.danger + '60', backgroundColor: colors.danger + '10' }]}>
              <Text style={{ color: colors.danger, fontWeight: '700' }}>Order Failed</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{error}</Text>
            </Card>
          )}

          {/* Billing Information */}
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Billing Information</Text>
            <View style={styles.row2}>
              <TextInput placeholder="First Name *" value={form.firstName} onChangeText={(t)=>update('firstName', t)} style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]} placeholderTextColor={colors.textSecondary} />
              <TextInput placeholder="Last Name *" value={form.lastName} onChangeText={(t)=>update('lastName', t)} style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]} placeholderTextColor={colors.textSecondary} />
            </View>
            <TextInput placeholder="Email *" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(t)=>update('email', t)} style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]} placeholderTextColor={colors.textSecondary} />
            <TextInput placeholder="Address *" value={form.address} onChangeText={(t)=>update('address', t)} style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]} placeholderTextColor={colors.textSecondary} />
            <View style={styles.row2}>
              <TextInput placeholder="City *" value={form.city} onChangeText={(t)=>update('city', t)} style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]} placeholderTextColor={colors.textSecondary} />
              <TextInput placeholder="Country *" value={form.country} onChangeText={(t)=>update('country', t)} style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]} placeholderTextColor={colors.textSecondary} />
            </View>
            <TextInput placeholder="ZIP / Postal Code *" value={form.zipCode} onChangeText={(t)=>update('zipCode', t)} style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]} placeholderTextColor={colors.textSecondary} />
          </Card>

          {/* Order Summary */}
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Order Summary</Text>
            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={2}>{item.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Qty: {item.quantity}</Text>
                </View>
                <Text style={[styles.itemPrice, { color: colors.textPrimary }]}>{(item.price * item.quantity).toFixed(2)} {item.currency || 'USD'}</Text>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.totalRow}><Text style={{ color: colors.textSecondary }}>Subtotal</Text><Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{total.toFixed(2)} USD</Text></View>
            <View style={styles.totalRow}><Text style={{ color: colors.textSecondary }}>Tax (10%)</Text><Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{tax.toFixed(2)} USD</Text></View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.totalRow}><Text style={[styles.grandTotal, { color: colors.textPrimary }]}>Total</Text><Text style={[styles.grandTotal, { color: colors.textPrimary }]}>{grandTotal.toFixed(2)} USD</Text></View>
            <Pressable style={[styles.payButton, { backgroundColor: isProcessing ? colors.muted : colors.accent }]} disabled={isProcessing} onPress={handleSubmit}>
              {isProcessing ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={[styles.payLabel, { color: colors.background }]}>Complete Purchase</Text>
              )}
            </Pressable>
            <Text style={{ textAlign: 'center', marginTop: 8, color: colors.textSecondary, fontSize: 12 }}>By purchasing you agree to our Terms and Privacy Policy.</Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  content: { padding: 16 },
  card: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  row2: { flexDirection: 'row', gap: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  itemName: { fontSize: 14, fontWeight: '600' },
  itemPrice: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1, marginVertical: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  grandTotal: { fontSize: 16, fontWeight: '800' },
  payButton: { marginTop: 12, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  payLabel: { fontSize: 16, fontWeight: '700' },
  alert: { marginBottom: 16, padding: 12, borderRadius: 10, borderWidth: 1 },
});
