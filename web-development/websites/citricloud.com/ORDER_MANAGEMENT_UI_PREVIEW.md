# Order Management UI Preview

## Main Orders Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  Orders Management                                    🔍 Search  🔽 Filter│
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Order #          Customer         Amount    Status        Date   Actions│
│  ────────────────────────────────────────────────────────────────────── │
│  ORD-20231211-A1  user@email.com  $299 USD  ● Pending    12/11   👁️    │
│  ORD-20231211-B2  john@email.com  $450 USD  ● Working On 12/11   👁️    │
│  ORD-20231210-C3  jane@email.com  $199 USD  ● Shipped    12/10   👁️    │
│  ORD-20231210-D4  bob@email.com   $350 USD  ● Completed  12/10   👁️    │
│                                                                         │
│                     ◄ Previous   Page 1 of 5   Next ►                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Status Badge Colors:
- **Pending** - Gray badge
- **Planned** - Blue badge
- **Working On** - Purple badge
- **Processing** - Yellow badge
- **In Production** - Orange badge
- **Quality Check** - Indigo badge
- **Ready to Ship** - Teal badge
- **Shipped** - Cyan badge
- **Delivered** - Green badge
- **On Hold** - Amber badge
- **Cancelled** - Red badge
- **Refunded** - Pink badge
- **Completed** - Emerald badge

## Filter Dropdown

```
┌──────────────────────┐
│ All Status       ▼  │
├──────────────────────┤
│ All Status           │
│ Pending              │
│ Planned              │
│ Working On           │
│ Processing           │
│ In Production        │
│ Quality Check        │
│ Ready to Ship        │
│ Shipped              │
│ Delivered            │
│ On Hold              │
│ Cancelled            │
│ Refunded             │
│ Completed            │
└──────────────────────┘
```

## Order Detail Modal (Click eye icon 👁️)

```
┌───────────────────────────────────────────────────────────────────┐
│  Order Details                                              ✖     │
│  ORD-20231211-ABC123                                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  👤 Customer Information         📦 Order Information            │
│  ┌──────────────────────────┐   ┌──────────────────────────┐    │
│  │ Name: John Doe           │   │ 📅 Created: 12/11/2023   │    │
│  │ Email: john@email.com    │   │ 🕐 Updated: 12/11/2023   │    │
│  └──────────────────────────┘   │ 💰 Total: $450 USD       │    │
│                                  └──────────────────────────┘    │
│                                                                   │
│  📍 Shipping Address             🔄 Order Status                 │
│  ┌──────────────────────────┐   ┌──────────────────────────┐    │
│  │ 123 Main Street          │   │ Current Status:          │    │
│  │ New York, NY 10001       │   │ ● Working On             │    │
│  │ United States            │   │                          │    │
│  └──────────────────────────┘   │ Change Status:           │    │
│                                  │ ┌────────────────────┐   │    │
│  📝 Notes                        │ │ Working On      ▼ │   │    │
│  ┌──────────────────────────┐   │ └────────────────────┘   │    │
│  │ Customer requested       │   └──────────────────────────┘    │
│  │ express shipping         │                                   │
│  └──────────────────────────┘                                   │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│                                      Cancel   Update Status      │
└───────────────────────────────────────────────────────────────────┘
```

## Status Change Dropdown (in Modal)

```
┌──────────────────────┐
│ Working On       ▼  │  ← Current selection
├──────────────────────┤
│ Pending              │
│ Planned              │
│ ● Working On         │  ← Currently active
│ Processing           │
│ In Production        │
│ Quality Check        │
│ Ready to Ship        │
│ Shipped              │
│ Delivered            │
│ On Hold              │
│ Cancelled            │
│ Refunded             │
│ Completed            │
└──────────────────────┘
```

## Success Toast Notification

```
┌─────────────────────────────────────────────┐
│  ✓ Order status updated successfully        │
│  Order status updated from working_on to    │
│  quality_check                              │
└─────────────────────────────────────────────┘
```

## Customer Notification (What customer sees)

```
┌───────────────────────────────────────────────────────────┐
│  🔔 New Notification                                      │
├───────────────────────────────────────────────────────────┤
│  📦 Order Status Updated                                  │
│  Your order ORD-20231211-ABC123 is undergoing quality    │
│  check.                                                   │
│                                                           │
│  View Order → /dashboard/erp/orders/123                  │
│                                                           │
│  2 minutes ago                                            │
└───────────────────────────────────────────────────────────┘
```

## Workflow Visualization

### Standard Manufacturing Workflow:
```
Pending → Planned → Working On → In Production → 
Quality Check → Ready to Ship → Shipped → Delivered → Completed

├──────┼──────────┼────────────┼───────────────┼
Day 1   Day 2      Day 3-4      Day 5-6        
```

### Quick Service Order:
```
Pending → Processing → Completed

├──────┼────────────┼
Hour 1  Hour 2-3     Hour 4
```

### Order with Issues:
```
Pending → Working On → On Hold → Working On → 
Quality Check → Completed

├──────┼────────────┼─────────┼────────────┼
Day 1   Day 2        Day 3     Day 4-5     
        (Issue found) (Fixed)
```

## Status Color Reference

| Status | Light Mode | Dark Mode |
|--------|-----------|-----------|
| Pending | 🔘 Gray | ⚪ Light Gray |
| Planned | 🔵 Blue | 💙 Light Blue |
| Working On | 🟣 Purple | 💜 Light Purple |
| Processing | 🟡 Yellow | 💛 Light Yellow |
| In Production | 🟠 Orange | 🧡 Light Orange |
| Quality Check | 🔵 Indigo | 💙 Light Indigo |
| Ready to Ship | 🔷 Teal | 💚 Light Teal |
| Shipped | 🔵 Cyan | 💙 Light Cyan |
| Delivered | 🟢 Green | 💚 Light Green |
| On Hold | 🟡 Amber | ⚠️ Light Amber |
| Cancelled | 🔴 Red | ❤️ Light Red |
| Refunded | 💗 Pink | 💕 Light Pink |
| Completed | 🟢 Emerald | ✅ Light Emerald |

## Mobile View (Responsive)

```
┌─────────────────────────┐
│  Orders Management      │
│  ──────────────────────│
│  🔍 Search orders...    │
│  🔽 All Status          │
├─────────────────────────┤
│                         │
│ ORD-20231211-A1         │
│ user@email.com          │
│ $299 USD                │
│ ● Pending               │
│ 12/11  👁️               │
│ ─────────────────────── │
│                         │
│ ORD-20231211-B2         │
│ john@email.com          │
│ $450 USD                │
│ ● Working On            │
│ 12/11  👁️               │
│ ─────────────────────── │
│                         │
│  ◄ Prev  1/5  Next ►    │
│                         │
└─────────────────────────┘
```

## Features

### Interactive Elements:
- ✅ Click eye icon to view details
- ✅ Click anywhere on row to select (optional)
- ✅ Hover effects on buttons
- ✅ Animated transitions
- ✅ Loading spinners
- ✅ Toast notifications

### Accessibility:
- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ High contrast colors
- ✅ Clear focus indicators
- ✅ Descriptive button labels

### Performance:
- ✅ Lazy loading with pagination
- ✅ Efficient re-renders
- ✅ Optimistic UI updates
- ✅ Cached data with React Query

## Example User Flow

1. **Admin visits page**
   - Sees list of all orders
   - Orders are paginated (10 per page)
   
2. **Admin filters by status**
   - Selects "Working On" from dropdown
   - List updates to show only "Working On" orders
   
3. **Admin clicks eye icon**
   - Modal smoothly slides in
   - Shows complete order details
   
4. **Admin changes status**
   - Selects "Quality Check" from dropdown
   - Clicks "Update Status"
   - Loading spinner appears
   
5. **Status updated**
   - Success toast appears
   - Modal closes
   - Order list refreshes
   - Customer receives notification

## Benefits

✨ **Professional appearance**
✨ **Easy to use**
✨ **Clear status visibility**
✨ **Fast updates**
✨ **Automatic customer notifications**
✨ **Complete order tracking**
✨ **Responsive design**
✨ **Dark mode support**

---

This visual reference shows exactly how the order management system will appear and function in your ERP panel!
