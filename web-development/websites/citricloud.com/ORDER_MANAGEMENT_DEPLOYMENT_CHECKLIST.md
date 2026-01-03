# Order Management Deployment Checklist

## Pre-Deployment

### Backend Verification
- [x] OrderStatus enum updated with 13 statuses
- [x] PATCH endpoint created at `/erp/orders/{order_id}/status`
- [x] Notification system integrated
- [x] Admin permission required
- [x] Error handling implemented
- [ ] Run migration script (if needed)
- [ ] Test endpoint with Postman/curl

### Frontend Verification  
- [x] OrderDetailModal component created
- [x] ERPOrders component updated
- [x] API client updated with new method
- [x] All imports correct
- [x] TypeScript types valid
- [ ] Build frontend successfully
- [ ] Check for console errors

### Testing
- [ ] Test status update via UI
- [ ] Verify customer notifications sent
- [ ] Check all 13 statuses work
- [ ] Test filter dropdown
- [ ] Test search functionality
- [ ] Verify modal opens/closes
- [ ] Test on mobile device
- [ ] Test in dark mode

## Deployment Steps

### 1. Backup Current System
```bash
# Backup database
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com
./backup.sh

# Verify backup created
ls -lh backups/
```

### 2. Run Migration (Optional)
```bash
cd backend
python migrate_order_statuses.py
```

Expected output:
```
Found X orders to check...
✅ All orders already have valid status values
✅ Migration Complete!
```

### 3. Restart Backend
```bash
# Stop current backend
pkill -f "uvicorn"

# Start backend
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com
./start.sh
```

### 4. Rebuild Frontend
```bash
cd frontend

# Install dependencies (if needed)
npm install

# Build
npm run build

# Deploy
npm run deploy
```

### 5. Verify Deployment
```bash
# Check backend is running
curl http://localhost:8000/api/v1/health

# Check frontend is built
ls -lh frontend/dist/

# Check services
systemctl status citricloud-backend
systemctl status nginx
```

## Post-Deployment Testing

### Quick Smoke Test
1. [ ] Open browser to https://citricloud.com
2. [ ] Log in as admin
3. [ ] Navigate to Dashboard → ERP → Orders
4. [ ] Verify orders list loads
5. [ ] Click eye icon on an order
6. [ ] Modal opens successfully
7. [ ] Change status dropdown works
8. [ ] Update status (test with one order)
9. [ ] Verify success message appears
10. [ ] Check customer notification received

### Detailed Testing

#### Test Each Status
- [ ] Pending
- [ ] Planned
- [ ] Working On
- [ ] Processing
- [ ] In Production
- [ ] Quality Check
- [ ] Ready to Ship
- [ ] Shipped
- [ ] Delivered
- [ ] On Hold
- [ ] Cancelled
- [ ] Refunded
- [ ] Completed

#### Test Filter
- [ ] Filter by each status
- [ ] Verify correct orders show
- [ ] Reset to "All Status"

#### Test Search
- [ ] Search by order number
- [ ] Search partial match
- [ ] Clear search

#### Test Modal
- [ ] Open modal
- [ ] Close with X button
- [ ] Close with Cancel button
- [ ] Close with Escape key
- [ ] Click outside to close

#### Test Notifications
- [ ] Customer receives notification
- [ ] Notification has correct message
- [ ] Notification link works
- [ ] Notification shows in bell icon

#### Test Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

#### Test Dark Mode
- [ ] Toggle dark mode
- [ ] Status badges readable
- [ ] Modal colors correct
- [ ] Table contrast good

## Rollback Plan (If Issues Occur)

### Quick Rollback
```bash
# Restore database backup
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com
./restore.sh backups/LATEST_BACKUP.tar.gz

# Revert code changes (if needed)
git checkout HEAD~1 backend/app/models/models.py
git checkout HEAD~1 backend/app/api/v1/endpoints/erp.py
git checkout HEAD~1 frontend/src/lib/api.ts
git checkout HEAD~1 frontend/src/pages/dashboard/ERPOrders.tsx
rm frontend/src/components/OrderDetailModal.tsx

# Rebuild frontend
cd frontend
npm run build

# Restart services
./start.sh
```

## Common Issues & Solutions

### Issue: Status not updating
**Solution:**
- Check browser console for errors
- Verify admin permissions
- Check backend logs
- Verify API endpoint responding

### Issue: Modal not opening
**Solution:**
- Check import statement
- Verify component path
- Check for JavaScript errors
- Clear browser cache

### Issue: Notifications not sending
**Solution:**
- Check notification_models imported
- Verify user_id exists
- Check notification settings
- Review backend logs

### Issue: Colors not showing
**Solution:**
- Rebuild frontend with npm run build
- Clear browser cache
- Check CSS class names
- Verify Tailwind config

### Issue: Filter not working
**Solution:**
- Check status parameter casing
- Verify API endpoint
- Check React Query cache
- Review network requests

## Monitoring After Deployment

### Check These Metrics
- [ ] Backend response times (< 200ms)
- [ ] Frontend load time (< 2s)
- [ ] No JavaScript errors in console
- [ ] No 500 errors in backend
- [ ] Database query performance
- [ ] Memory usage stable
- [ ] CPU usage normal

### Monitor For
- [ ] Failed status updates
- [ ] Missing notifications
- [ ] Slow page loads
- [ ] UI glitches
- [ ] Mobile issues

## Success Criteria

✅ **Deployment is successful when:**

1. Orders page loads without errors
2. All 13 statuses appear in filter
3. Status update works correctly
4. Notifications sent to customers
5. Modal displays properly
6. Search and filter functional
7. No console errors
8. Responsive on all devices
9. Dark mode works correctly
10. Users can complete full workflow

## Documentation Updated

- [x] ORDER_MANAGEMENT_GUIDE.md
- [x] ORDER_STATUS_QUICK_REFERENCE.md
- [x] ORDER_MANAGEMENT_IMPLEMENTATION_SUMMARY.md
- [x] ORDER_MANAGEMENT_UI_PREVIEW.md
- [x] This deployment checklist

## Support Resources

### If you need help:

1. **Check Documentation**
   - Read ORDER_MANAGEMENT_GUIDE.md
   - Review ORDER_STATUS_QUICK_REFERENCE.md
   - Check ORDER_MANAGEMENT_UI_PREVIEW.md

2. **Run Test Scripts**
   ```bash
   cd backend
   python test_order_status.py test
   python test_order_status.py list
   python test_order_status.py stats
   ```

3. **Check Logs**
   ```bash
   # Backend logs
   tail -f backend/logs/app.log
   
   # Nginx logs
   tail -f /var/log/nginx/error.log
   ```

4. **Verify Database**
   ```bash
   cd backend
   python -c "from app.models.models import OrderStatus; print([s.value for s in OrderStatus])"
   ```

## Final Notes

- The system is backward compatible
- Existing orders will work normally
- No data loss risk
- Can rollback if needed
- All changes documented
- Test scripts included

**Ready to Deploy! 🚀**

---

Last Updated: December 11, 2023
Version: 1.0.0
