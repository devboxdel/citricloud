# Order Status Management - Quick Reference

## Available Order Statuses

| Status | Description | Use Case | Color |
|--------|-------------|----------|-------|
| 🔵 **Pending** | Order received, awaiting review | Initial state | Gray |
| 📋 **Planned** | Scheduled for production | Production planning | Blue |
| 🔨 **Working On** | Currently being worked on | Active production | Purple |
| ⚙️ **Processing** | General processing state | Standard workflow | Yellow |
| 🏭 **In Production** | Manufacturing in progress | Production line | Orange |
| ✅ **Quality Check** | Under quality review | QA/QC stage | Indigo |
| 📦 **Ready to Ship** | Packaged and ready | Warehouse ready | Teal |
| 🚚 **Shipped** | In transit to customer | Shipping phase | Cyan |
| 🎉 **Delivered** | Received by customer | Delivery confirmed | Green |
| ⏸️ **On Hold** | Temporarily paused | Issues/delays | Amber |
| ❌ **Cancelled** | Order cancelled | Cancellation | Red |
| 💰 **Refunded** | Payment returned | Refund processed | Pink |
| ✨ **Completed** | Order fully finished | Final state | Emerald |

## Common Workflows

### Manufacturing Workflow
```
Pending → Planned → Working On → In Production → 
Quality Check → Ready to Ship → Shipped → Delivered → Completed
```

### Service/Digital Products
```
Pending → Processing → Completed
```

### Custom Orders
```
Pending → Planned → Working On → Quality Check → 
Ready to Ship → Shipped → Delivered → Completed
```

### Problem Resolution
```
In Production → On Hold (issue found) → 
Working On (fix applied) → Quality Check → Completed
```

## Quick Actions

### View Order Details
1. Navigate to **Dashboard → ERP → Orders**
2. Click **eye icon** (👁️) on any order
3. Modal opens with full details

### Change Order Status
1. Open order details (click eye icon)
2. View current status in colored badge
3. Select new status from dropdown
4. Click **Update Status** button
5. Confirmation appears
6. Customer receives notification automatically

### Filter Orders
- Use the **Filter** dropdown in Orders page
- Select specific status to view
- Choose "All Status" to see everything

### Search Orders
- Use search box to find by order number
- Results update in real-time

## Status Change Impact

When you change an order status:

1. ✅ Order record is updated
2. 🔔 Customer receives notification
3. 📧 Notification includes order number and status
4. 🔗 Link to order details provided
5. ⏰ Timestamp recorded
6. 🔄 Order list refreshes automatically

## Permissions

**Required Role:** Administrator, System Admin, Manager, or Finance Manager

Status updates are restricted to authorized users only.

## Customer Notifications

Automatic messages sent:
- "Your order [ORDER_NUMBER] is pending review."
- "Your order [ORDER_NUMBER] has been planned for production."
- "Your order [ORDER_NUMBER] is now being worked on."
- "Your order [ORDER_NUMBER] is now in production."
- "Your order [ORDER_NUMBER] is undergoing quality check."
- "Your order [ORDER_NUMBER] is ready to ship."
- "Your order [ORDER_NUMBER] has been shipped."
- "Your order [ORDER_NUMBER] has been delivered."
- "Your order [ORDER_NUMBER] is on hold."
- "Your order [ORDER_NUMBER] has been cancelled."
- "Your order [ORDER_NUMBER] has been refunded."
- "Your order [ORDER_NUMBER] is completed."

## Tips

✨ **Best Practices:**
- Update status as soon as stage changes
- Use "On Hold" for temporary issues
- Add notes in order details for context
- Set "Completed" only when fully done
- Use "Quality Check" to ensure standards

⚠️ **Avoid:**
- Skipping important stages
- Setting to "Completed" prematurely
- Using "Cancelled" without customer contact
- Forgetting to update after status change

## Keyboard Shortcuts

- **Esc** - Close order detail modal
- **Enter** (in modal) - Update status (when changed)

## Mobile Support

✅ Fully responsive design
✅ Touch-friendly buttons
✅ Optimized modal layout
✅ Swipe-friendly table scrolling

## Dark Mode

All status colors are optimized for both light and dark themes with appropriate contrast ratios.
