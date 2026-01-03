"""
Migration script to update existing orders with new status values
This ensures backward compatibility with the expanded order status system
"""
import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.models import Order, OrderStatus


async def migrate_order_statuses():
    """Update existing order statuses to new enum values"""
    
    # Status mapping: old -> new
    status_migration_map = {
        'pending': OrderStatus.PENDING,
        'processing': OrderStatus.PROCESSING,
        'shipped': OrderStatus.SHIPPED,
        'delivered': OrderStatus.DELIVERED,
        'cancelled': OrderStatus.CANCELLED,
        'refunded': OrderStatus.REFUNDED,
    }
    
    async with AsyncSessionLocal() as db:
        # Get all orders
        result = await db.execute(select(Order))
        orders = result.scalars().all()
        
        updated_count = 0
        print(f"Found {len(orders)} orders to check...")
        
        for order in orders:
            # Ensure status is valid
            current_status = order.status.value if isinstance(order.status, OrderStatus) else order.status
            
            if current_status in status_migration_map:
                # Already using a valid status, no change needed
                print(f"Order {order.order_number}: {current_status} (valid)")
            else:
                # Unknown status, set to pending
                print(f"Order {order.order_number}: {current_status} -> pending (unknown status)")
                order.status = OrderStatus.PENDING
                updated_count += 1
        
        if updated_count > 0:
            await db.commit()
            print(f"\n✅ Updated {updated_count} orders with new status values")
        else:
            print("\n✅ All orders already have valid status values")
        
        # Show status distribution
        print("\n📊 Current Status Distribution:")
        status_counts = {}
        for order in orders:
            status = order.status.value if isinstance(order.status, OrderStatus) else order.status
            status_counts[status] = status_counts.get(status, 0) + 1
        
        for status, count in sorted(status_counts.items()):
            print(f"  {status}: {count} orders")


async def verify_statuses():
    """Verify all orders have valid status values"""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Order))
        orders = result.scalars().all()
        
        print("\n🔍 Verifying order statuses...")
        all_valid = True
        
        valid_statuses = [status.value for status in OrderStatus]
        
        for order in orders:
            status = order.status.value if isinstance(order.status, OrderStatus) else order.status
            if status not in valid_statuses:
                print(f"  ❌ Order {order.order_number} has invalid status: {status}")
                all_valid = False
        
        if all_valid:
            print("  ✅ All orders have valid status values")
        
        return all_valid


async def main():
    """Main migration function"""
    print("=" * 60)
    print("Order Status Migration Script")
    print("=" * 60)
    print()
    print("New statuses available:")
    for status in OrderStatus:
        print(f"  - {status.value}")
    print()
    
    # Run migration
    await migrate_order_statuses()
    
    # Verify results
    await verify_statuses()
    
    print()
    print("=" * 60)
    print("Migration Complete!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
