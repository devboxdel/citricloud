import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/colors';
import { Card } from '../components/Card';
import { useCartStore } from '../store/cartStore';

export default function CartScreen({ navigation }: any) {
  const colors = useColors();
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const total = useMemo(() => getTotal(), [items]);
  const tax = total * 0.1;
  const grandTotal = total + tax;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { borderBottomColor: colors.border }]}> 
        <Pressable onPress={() => navigation?.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Cart</Text>
        <Pressable onPress={() => clearCart()} style={styles.headerButton}>
          <Ionicons name="trash-outline" size={22} color={colors.muted} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Card style={styles.card}>
          {items.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>Your cart is empty.</Text>
          ) : (
            <>
              {items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={2}>{item.name}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.price.toFixed(2)} {item.currency || 'USD'}</Text>
                  </View>
                  <View style={styles.qtyControls}>
                    <Pressable style={[styles.qtyBtn, { borderColor: colors.accent }]} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Ionicons name="remove" size={16} color={colors.accent} />
                    </Pressable>
                    <Text style={{ color: colors.textPrimary, minWidth: 24, textAlign: 'center' }}>{item.quantity}</Text>
                    <Pressable style={[styles.qtyBtn, { borderColor: colors.accent }]} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Ionicons name="add" size={16} color={colors.accent} />
                    </Pressable>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>{(item.price * item.quantity).toFixed(2)}</Text>
                    <Pressable onPress={() => removeItem(item.id)}>
                      <Ionicons name="close-circle" size={18} color={colors.muted} />
                    </Pressable>
                  </View>
                </View>
              ))}

              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.totalRow}><Text style={{ color: colors.textSecondary }}>Subtotal</Text><Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{total.toFixed(2)} USD</Text></View>
              <View style={styles.totalRow}><Text style={{ color: colors.textSecondary }}>Tax (10%)</Text><Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{tax.toFixed(2)} USD</Text></View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.totalRow}><Text style={[styles.grandTotal, { color: colors.textPrimary }]}>Total</Text><Text style={[styles.grandTotal, { color: colors.textPrimary }]}>{grandTotal.toFixed(2)} USD</Text></View>
              <Pressable onPress={() => navigation.navigate('Checkout')} style={[styles.checkoutBtn, { backgroundColor: colors.accent }]}>
                <Text style={[styles.checkoutLabel, { color: colors.background }]}>Proceed to Checkout</Text>
              </Pressable>
            </>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderBottomWidth: 1 },
  headerButton: { padding: 6 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600' },
  card: { marginBottom: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemName: { fontSize: 14, fontWeight: '600' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { borderWidth: 1, borderRadius: 8, padding: 6 },
  itemRight: { alignItems: 'flex-end', marginLeft: 12 },
  itemTotal: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  divider: { height: 1, marginVertical: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  grandTotal: { fontSize: 16, fontWeight: '800' },
  checkoutBtn: { marginTop: 12, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkoutLabel: { fontSize: 16, fontWeight: '700' },
});
