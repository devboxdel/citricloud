"""
Test script for Order Status Management
Demonstrates the new order status update functionality
"""
import asyncio
import sys
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.models import Order, OrderStatus, User
from datetime import datetime


async def test_order_status_update():
    """Test updating order statuses"""
    async with AsyncSessionLocal() as db:
        # Get a test order
        result = await db.execute(select(Order).limit(1))
        order = result.scalar_one_or_none()
        
        if not order:
            print("❌ No orders found in database. Create an order first.")
            return
        
        print("=" * 70)
        print("Order Status Update Test")
        print("=" * 70)
        print()
        
        # Display order info
        print(f"📦 Order: {order.order_number}")
        print(f"💰 Amount: ${order.total_amount} {order.currency}")
        print(f"📅 Created: {order.created_at}")
        print(f"🔄 Current Status: {order.status.value}")
        print()
        
        # Show available statuses
        print("Available Statuses:")
        print("-" * 70)
        for i, status in enumerate(OrderStatus, 1):
            marker = "✓" if status == order.status else " "
            print(f"[{marker}] {i:2d}. {status.value:20s} - {get_status_description(status)}")
        print()
        
        # Simulate status progression
        print("Simulating Status Progression:")
        print("-" * 70)
        
        # Common workflow progression
        workflow = [
            OrderStatus.PENDING,
            OrderStatus.PLANNED,
            OrderStatus.WORKING_ON,
            OrderStatus.IN_PRODUCTION,
            OrderStatus.QUALITY_CHECK,
            OrderStatus.READY_TO_SHIP,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
            OrderStatus.COMPLETED
        ]
        
        print(f"Starting: {order.status.value}")
        
        # Find current position in workflow
        try:
            current_idx = workflow.index(order.status)
        except ValueError:
            current_idx = 0
        
        # Show next steps
        if current_idx < len(workflow) - 1:
            print(f"\n📋 Recommended next status: {workflow[current_idx + 1].value}")
            print(f"\n🔄 Full workflow from current position:")
            for status in workflow[current_idx:]:
                is_current = status == order.status
                symbol = "→" if not is_current else "●"
                print(f"   {symbol} {status.value}")
        else:
            print("\n✅ Order is at final status (Completed)")
        
        print()
        print("=" * 70)
        print("Test Complete")
        print("=" * 70)


def get_status_description(status: OrderStatus) -> str:
    """Get human-readable description for each status"""
    descriptions = {
        OrderStatus.PENDING: "Order received, awaiting review",
        OrderStatus.PLANNED: "Scheduled for production",
        OrderStatus.WORKING_ON: "Currently being worked on",
        OrderStatus.PROCESSING: "General processing state",
        OrderStatus.IN_PRODUCTION: "Manufacturing in progress",
        OrderStatus.QUALITY_CHECK: "Under quality review",
        OrderStatus.READY_TO_SHIP: "Packaged and ready",
        OrderStatus.SHIPPED: "In transit to customer",
        OrderStatus.DELIVERED: "Received by customer",
        OrderStatus.ON_HOLD: "Temporarily paused",
        OrderStatus.CANCELLED: "Order cancelled",
        OrderStatus.REFUNDED: "Payment returned",
        OrderStatus.COMPLETED: "Order fully finished"
    }
    return descriptions.get(status, "Unknown status")


async def list_orders_by_status():
    """List all orders grouped by status"""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Order))
        orders = result.scalars().all()
        
        if not orders:
            print("No orders found in database.")
            return
        
        print("=" * 70)
        print("Orders by Status")
        print("=" * 70)
        print()
        
        # Group orders by status
        status_groups = {}
        for order in orders:
            status = order.status.value
            if status not in status_groups:
                status_groups[status] = []
            status_groups[status].append(order)
        
        # Display grouped orders
        for status in OrderStatus:
            status_value = status.value
            if status_value in status_groups:
                orders_in_status = status_groups[status_value]
                print(f"\n📊 {status_value.upper()} ({len(orders_in_status)} orders)")
                print("-" * 70)
                for order in orders_in_status:
                    user_email = "Unknown"
                    if order.user:
                        user_email = order.user.email
                    print(f"  {order.order_number:20s} ${order.total_amount:8.2f} {order.currency:5s} {user_email}")
        
        print()
        print("=" * 70)


async def show_status_statistics():
    """Show statistics about order statuses"""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Order))
        orders = result.scalars().all()
        
        if not orders:
            print("No orders found in database.")
            return
        
        print("=" * 70)
        print("Order Status Statistics")
        print("=" * 70)
        print()
        
        # Calculate statistics
        total_orders = len(orders)
        status_counts = {}
        total_amount = 0
        
        for order in orders:
            status = order.status.value
            status_counts[status] = status_counts.get(status, 0) + 1
            total_amount += order.total_amount
        
        # Display statistics
        print(f"Total Orders: {total_orders}")
        print(f"Total Amount: ${total_amount:.2f}")
        print(f"Average Order: ${total_amount/total_orders:.2f}")
        print()
        
        print("Status Distribution:")
        print("-" * 70)
        for status in OrderStatus:
            count = status_counts.get(status.value, 0)
            if count > 0:
                percentage = (count / total_orders) * 100
                bar = "█" * int(percentage / 2)
                print(f"{status.value:20s} {count:3d} ({percentage:5.1f}%) {bar}")
        
        print()
        print("=" * 70)


async def main():
    """Main test function"""
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "list":
            await list_orders_by_status()
        elif command == "stats":
            await show_status_statistics()
        elif command == "test":
            await test_order_status_update()
        else:
            print(f"Unknown command: {command}")
            print_usage()
    else:
        # Default: run test
        await test_order_status_update()


def print_usage():
    """Print usage information"""
    print()
    print("Usage: python test_order_status.py [command]")
    print()
    print("Commands:")
    print("  test   - Test order status update (default)")
    print("  list   - List orders grouped by status")
    print("  stats  - Show order status statistics")
    print()


if __name__ == "__main__":
    asyncio.run(main())
