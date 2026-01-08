"""
ERP Dashboard - Orders, Invoices, Tickets management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, delete
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import datetime
import secrets
import os
from pathlib import Path

from app.core.database import get_db
from app.api.dependencies import get_current_user, require_admin
from app.models.models import User, Order, OrderItem, Invoice, Ticket, Product, ProductCategory, Supplier, Report, OrderStatus, InvoiceStatus, TicketStatus, ReportType, StockMovement
from app.schemas.schemas import (
    OrderCreate, OrderUpdate, OrderResponse,
    InvoiceCreate, InvoiceUpdate, InvoiceResponse,
    TicketCreate, TicketUpdate, TicketResponse,
    SupplierCreate, SupplierUpdate, SupplierResponse,
    ReportCreate, ReportResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    ProductCategoryCreate, ProductCategoryUpdate, ProductCategoryResponse,
    PaginatedResponse, StockMovementResponse, StockUpdateRequest, StockBulkAdjustmentRequest
)

router = APIRouter()


# ========== Orders ==========

@router.get("/orders", response_model=PaginatedResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status_filter: Optional[OrderStatus] = None,
    user_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List orders with pagination"""
    query = select(Order).options(selectinload(Order.user))
    
    if search:
        query = query.where(Order.order_number.ilike(f"%{search}%"))
    
    if status_filter:
        query = query.where(Order.status == status_filter)
    
    if user_id:
        query = query.where(Order.user_id == user_id)
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    orders = result.scalars().all()
    
    # Serialize orders to dictionaries
    items = []
    for order in orders:
        items.append({
            "id": order.id,
            "order_number": order.order_number,
            "user_id": order.user_id,
            "user": {
                "id": order.user.id,
                "email": order.user.email,
                "full_name": order.user.full_name
            } if order.user else None,
            "status": order.status,
            "total_amount": order.total_amount,
            "currency": order.currency,
            "shipping_address": order.shipping_address,
            "billing_address": order.billing_address,
            "notes": order.notes,
            "created_at": order.created_at,
            "updated_at": order.updated_at
        })
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get order by ID"""
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order


@router.get("/my-orders", response_model=PaginatedResponse)
async def get_my_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's orders"""
    query = select(Order).where(Order.user_id == current_user.id)
    
    count_query = select(func.count()).select_from(Order).where(Order.user_id == current_user.id)
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    orders = result.scalars().all()
    
    # Manually load order_items for each order to avoid role type mismatch
    order_responses = []
    for order in orders:
        await db.refresh(order, ['order_items'])
        order_responses.append(OrderResponse.model_validate(order))
    
    return {
        "items": order_responses,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.post("/orders", response_model=OrderResponse, status_code=201)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new order"""
    # Generate order number
    order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"
    
    # Calculate total
    total_amount = 0
    order_items_data = []
    
    for item in order_data.items:
        # Get product
        product_result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = product_result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        # Check if demo product - only system_admin can purchase
        if product.slug == "demo-product" and current_user.role != "system_admin":
            raise HTTPException(
                status_code=403, 
                detail="Demo product is only available for System Administrators"
            )
        
        if not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product {product.name} is not available")
        
        if product.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        
        unit_price = product.sale_price if product.sale_price else product.price
        item_total = unit_price * item.quantity
        total_amount += item_total
        
        order_items_data.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "unit_price": unit_price,
            "total_price": item_total
        })
        
        # Update stock
        product.stock_quantity -= item.quantity
    
    # Calculate tax and grand total
    tax_amount = total_amount * 0.10
    grand_total = total_amount + tax_amount

    # Create order
    order = Order(
        order_number=order_number,
        user_id=current_user.id,
        total_amount=grand_total,
        shipping_address=order_data.shipping_address,
        billing_address=order_data.billing_address or order_data.shipping_address,
        notes=order_data.notes,
        status=OrderStatus.PROCESSING
    )
    
    db.add(order)
    await db.flush()
    
    # Create order items
    for item_data in order_items_data:
        order_item = OrderItem(order_id=order.id, **item_data)
        db.add(order_item)
        
    # Create Invoice
    invoice_number = f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"
    invoice = Invoice(
        invoice_number=invoice_number,
        order_id=order.id,
        status=InvoiceStatus.PAID,
        amount=total_amount,
        tax_amount=tax_amount,
        total_amount=grand_total,
        currency="USD",
        due_date=datetime.utcnow(),
        paid_date=datetime.utcnow(),
        notes="Generated automatically from checkout"
    )
    db.add(invoice)
    
    await db.commit()
    
    # Refresh order with only the items relationship
    await db.refresh(order, attribute_names=['order_items'])

    # Notification: New Order
    from app.models.notification_models import NotificationType, NotificationPriority, Notification
    notification = Notification(
        user_id=current_user.id,
        title="Order Placed",
        message=f"Your order {order.order_number} has been placed successfully.",
        type=NotificationType.SUCCESS,
        priority=NotificationPriority.NORMAL,
        link=f"/dashboard/erp/orders/{order.id}",
        icon="FiShoppingCart"
    )
    db.add(notification)
    await db.commit()

    return order


@router.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update order"""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    for field, value in order_data.model_dump(exclude_unset=True).items():
        setattr(order, field, value)
    
    await db.commit()
    await db.refresh(order)
    
    return order


@router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: OrderStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update order status"""
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    old_status = order.status
    order.status = status
    order.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(order)
    
    # Send notification to customer about status change
    from app.models.notification_models import NotificationType, NotificationPriority, Notification
    
    status_messages = {
        OrderStatus.PENDING: "is pending review",
        OrderStatus.PLANNED: "has been planned for production",
        OrderStatus.WORKING_ON: "is now being worked on",
        OrderStatus.PROCESSING: "is being processed",
        OrderStatus.IN_PRODUCTION: "is now in production",
        OrderStatus.QUALITY_CHECK: "is undergoing quality check",
        OrderStatus.READY_TO_SHIP: "is ready to ship",
        OrderStatus.SHIPPED: "has been shipped",
        OrderStatus.DELIVERED: "has been delivered",
        OrderStatus.ON_HOLD: "is on hold",
        OrderStatus.CANCELLED: "has been cancelled",
        OrderStatus.REFUNDED: "has been refunded",
        OrderStatus.COMPLETED: "is completed"
    }
    
    message = f"Your order {order.order_number} {status_messages.get(status, 'status has been updated')}."
    
    notification = Notification(
        user_id=order.user_id,
        title="Order Status Updated",
        message=message,
        type=NotificationType.INFO,
        priority=NotificationPriority.NORMAL,
        link=f"/dashboard/erp/orders/{order.id}",
        icon="FiPackage"
    )
    db.add(notification)
    await db.commit()
    
    return {
        "id": order.id,
        "order_number": order.order_number,
        "old_status": old_status,
        "new_status": status,
        "updated_at": order.updated_at,
        "message": f"Order status updated from {old_status} to {status}"
    }


# ========== Invoices ==========

@router.get("/invoices", response_model=PaginatedResponse)
async def list_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List invoices with pagination - users see their own, admins see all"""
    # Load invoices with order and order.user relationships
    query = select(Invoice).options(
        selectinload(Invoice.order).selectinload(Order.user)
    )
    
    # Regular users can only see their own invoices (through order.user_id)
    user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value
    is_admin = user_role in ["system_admin", "developer", "administrator"]
    
    if not is_admin:
        # Filter by order's user_id
        query = query.join(Order).where(Order.user_id == current_user.id)
    
    if search:
        query = query.where(Invoice.invoice_number.ilike(f"%{search}%"))
    
    # Handle status filter - convert string to enum if provided
    if status_filter and status_filter.strip():
        try:
            status_enum = InvoiceStatus(status_filter)
            query = query.where(Invoice.status == status_enum)
        except ValueError:
            # Invalid status, ignore the filter
            pass
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.order_by(Invoice.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    invoices = result.scalars().all()
    
    # Serialize invoices to dictionaries (include customer info through order)
    items = []
    for invoice in invoices:
        # Get user through order relationship
        user = invoice.order.user if invoice.order else None
        user_id = invoice.order.user_id if invoice.order else None
        
        items.append({
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "order_id": invoice.order_id,
            "user_id": user_id,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name
            } if user else None,
            "status": invoice.status,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "due_date": invoice.due_date,
            "notes": invoice.notes,
            "created_at": invoice.created_at,
            "updated_at": invoice.updated_at
        })
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get invoice by ID - users can view their own, admins can view all"""
    result = await db.execute(
        select(Invoice)
        .options(selectinload(Invoice.order))
        .where(Invoice.id == invoice_id)
    )
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check if user has access to this invoice (through order)
    user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value
    is_admin = user_role in ["system_admin", "developer", "administrator"]
    
    if not is_admin and invoice.order and invoice.order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this invoice")
    
    return invoice


@router.post("/invoices", response_model=InvoiceResponse, status_code=201)
async def create_invoice(
    invoice_data: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new invoice from order"""
    # Get order
    order_result = await db.execute(select(Order).where(Order.id == invoice_data.order_id))
    order = order_result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if invoice already exists for this order
    existing_result = await db.execute(select(Invoice).where(Invoice.order_id == invoice_data.order_id))
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Invoice already exists for this order")
    
    # Generate invoice number
    invoice_number = f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"
    
    # Calculate amounts
    amount = order.total_amount
    tax_amount = amount * 0.1  # 10% tax
    total_amount = amount + tax_amount
    
    invoice = Invoice(
        invoice_number=invoice_number,
        order_id=order.id,
        amount=amount,
        tax_amount=tax_amount,
        total_amount=total_amount,
        due_date=invoice_data.due_date,
        notes=invoice_data.notes
    )
    
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)

    # Notification: New Invoice
    from app.models.notification_models import NotificationType, NotificationPriority, Notification
    notification = Notification(
        user_id=order.user_id,
        title="New Invoice",
        message=f"A new invoice {invoice.invoice_number} has been generated for your order {order.order_number}.",
        type=NotificationType.INFO,
        priority=NotificationPriority.NORMAL,
        link=f"/dashboard/erp/invoices/{invoice.id}",
        icon="FiFileText"
    )
    db.add(notification)
    await db.commit()

    return invoice


@router.put("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: int,
    invoice_data: InvoiceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update invoice - admins can update all fields, users can only update their own invoices"""
    result = await db.execute(
        select(Invoice)
        .options(selectinload(Invoice.order))
        .where(Invoice.id == invoice_id)
    )
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check permissions
    user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value
    is_admin = user_role in ["system_admin", "developer", "administrator"]
    
    # Regular users can only update their own invoices
    if not is_admin:
        if not invoice.order or invoice.order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied to this invoice")
        # Regular users cannot update status - only admins can
        if invoice_data.status is not None:
            raise HTTPException(status_code=403, detail="Only admins can update invoice status")
    
    for field, value in invoice_data.model_dump(exclude_unset=True).items():
        if field == 'status' and value:
            # Convert string status to enum
            try:
                value = InvoiceStatus(value)
            except ValueError:
                continue
        setattr(invoice, field, value)
    
    if invoice.status == InvoiceStatus.PAID and not invoice.paid_date:
        invoice.paid_date = datetime.utcnow()
    
    await db.commit()
    await db.refresh(invoice)
    
    return invoice
    return invoice


# ========== Tickets ==========

@router.get("/tickets", response_model=PaginatedResponse)
async def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status_filter: Optional[TicketStatus] = None,
    priority: Optional[str] = None,
    user_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List tickets with pagination"""
    query = select(Ticket).options(selectinload(Ticket.user))
    
    if search:
        query = query.where(
            (Ticket.ticket_number.ilike(f"%{search}%")) |
            (Ticket.subject.ilike(f"%{search}%"))
        )
    
    if status_filter:
        query = query.where(Ticket.status == status_filter)
    
    if priority:
        query = query.where(Ticket.priority == priority)
    
    if user_id:
        query = query.where(Ticket.user_id == user_id)
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.order_by(Ticket.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    tickets = result.scalars().all()
    
    # Serialize tickets to dictionaries
    items = []
    for ticket in tickets:
        items.append({
            "id": ticket.id,
            "ticket_number": ticket.ticket_number,
            "user_id": ticket.user_id,
            "user": {
                "id": ticket.user.id,
                "email": ticket.user.email,
                "full_name": ticket.user.full_name
            } if ticket.user else None,
            "subject": ticket.subject,
            "description": ticket.description,
            "status": ticket.status,
            "priority": ticket.priority,
            "category": ticket.category,
            "assigned_to": ticket.assigned_to,
            "resolution": ticket.resolution,
            "created_at": ticket.created_at,
            "updated_at": ticket.updated_at
        })
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/my-tickets", response_model=PaginatedResponse)
async def get_my_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[TicketStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's tickets"""
    query = select(Ticket).where(Ticket.user_id == current_user.id)
    
    if status_filter:
        query = query.where(Ticket.status == status_filter)
    
    count_query = select(func.count()).select_from(Ticket).where(Ticket.user_id == current_user.id)
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.order_by(Ticket.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    tickets = result.scalars().all()
    
    return {
        "items": tickets,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get ticket by ID"""
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Users can only see their own tickets unless they're admin
    user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value
    if ticket.user_id != current_user.id and user_role not in ["system_admin", "developer", "administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this ticket")
    
    return ticket


@router.post("/tickets", response_model=TicketResponse, status_code=201)
async def create_ticket(
    ticket_data: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new support ticket"""
    # Generate ticket number
    ticket_number = f"TKT-{datetime.utcnow().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"
    
    ticket = Ticket(
        ticket_number=ticket_number,
        user_id=current_user.id,
        subject=ticket_data.subject,
        description=ticket_data.description,
        priority=ticket_data.priority
    )
    
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    
    return ticket


@router.put("/tickets/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: int,
    ticket_data: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update ticket"""
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    for field, value in ticket_data.model_dump(exclude_unset=True).items():
        setattr(ticket, field, value)
    
    if ticket.status == TicketStatus.CLOSED and not ticket.closed_at:
        ticket.closed_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(ticket)
    
    return ticket


@router.get("/stats")
async def get_erp_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get ERP statistics"""
    # Orders stats
    total_orders_result = await db.execute(select(func.count(Order.id)))
    total_orders = total_orders_result.scalar()
    
    total_revenue_result = await db.execute(select(func.sum(Order.total_amount)))
    total_revenue = total_revenue_result.scalar() or 0
    
    # Invoices stats
    paid_invoices_result = await db.execute(
        select(func.count(Invoice.id)).where(Invoice.status == InvoiceStatus.PAID)
    )
    paid_invoices = paid_invoices_result.scalar()
    
    pending_invoices_result = await db.execute(
        select(func.count(Invoice.id)).where(Invoice.status.in_([InvoiceStatus.DRAFT, InvoiceStatus.SENT]))
    )
    pending_invoices = pending_invoices_result.scalar()
    
    # Tickets stats
    open_tickets_result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status.in_([TicketStatus.OPEN, TicketStatus.IN_PROGRESS]))
    )
    open_tickets = open_tickets_result.scalar()
    
    resolved_tickets_result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.RESOLVED)
    )
    resolved_tickets = resolved_tickets_result.scalar()
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "paid_invoices": paid_invoices,
        "pending_invoices": pending_invoices,
        "open_tickets": open_tickets,
        "resolved_tickets": resolved_tickets
    }


# ========== Suppliers ==========

@router.get("/suppliers", response_model=PaginatedResponse)
async def list_suppliers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List suppliers with pagination"""
    query = select(Supplier)
    
    if search:
        query = query.where(Supplier.name.ilike(f"%{search}%"))
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.order_by(Supplier.name.asc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    suppliers = result.scalars().all()
    
    return {
        "items": suppliers,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }

@router.post("/suppliers", response_model=SupplierResponse, status_code=201)
async def create_supplier(
    supplier_data: SupplierCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new supplier"""
    supplier = Supplier(**supplier_data.model_dump())
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier

@router.put("/suppliers/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: int,
    supplier_data: SupplierUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a supplier"""
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    for field, value in supplier_data.model_dump(exclude_unset=True).items():
        setattr(supplier, field, value)
    
    await db.commit()
    await db.refresh(supplier)
    return supplier


# ========== Reports ==========

@router.get("/reports", response_model=PaginatedResponse)
async def list_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type: Optional[ReportType] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List generated reports"""
    query = select(Report)
    if type:
        query = query.where(Report.type == type)
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.order_by(Report.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    reports = result.scalars().all()
    
    return {
        "items": reports,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.post("/reports", response_model=ReportResponse)
async def generate_report(
    report_data: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Generate a new report"""
    data = {}
    
    if report_data.type == ReportType.FINANCIAL:
        revenue_query = select(func.sum(Order.total_amount)).where(Order.status != OrderStatus.CANCELLED)
        # TODO: Apply date filters from report_data.parameters
        
        total_revenue_result = await db.execute(revenue_query)
        total_revenue = total_revenue_result.scalar() or 0
        data = {"total_revenue": total_revenue}
        
    elif report_data.type == ReportType.SUPPLIERS:
        count_query = select(func.count(Supplier.id))
        result = await db.execute(count_query)
        count = result.scalar()
        data = {"total_suppliers": count}
        
    elif report_data.type == ReportType.SALES:
        count_query = select(func.count(Order.id))
        result = await db.execute(count_query)
        count = result.scalar()
        data = {"total_orders": count}
    
    new_report = Report(
        name=report_data.name,
        type=report_data.type,
        parameters=report_data.parameters,
        data=data,
        created_by_id=current_user.id
    )
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    return new_report


# ========== Products ==========

@router.get("/products", response_model=PaginatedResponse)
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    is_active: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List products with pagination and filters"""
    from app.models.models import Product, ProductCategory
    
    query = select(Product).options(selectinload(Product.category))
    
    if search:
        query = query.where(
            (Product.name.ilike(f"%{search}%")) | 
            (Product.sku.ilike(f"%{search}%")) |
            (Product.slug.ilike(f"%{search}%"))
        )
    
    # Handle category_id filter - convert string to int if provided
    if category_id and category_id.isdigit():
        query = query.where(Product.category_id == int(category_id))
    
    # Handle is_active filter - convert string to boolean if provided
    if is_active and is_active.lower() in ('true', 'false'):
        is_active_bool = is_active.lower() == 'true'
        query = query.where(Product.is_active == is_active_bool)
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    products = result.scalars().all()
    
    # Serialize products to dictionaries
    items = []
    for product in products:
        items.append({
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "description": product.description,
            "short_description": product.short_description,
            "sku": product.sku,
            "price": product.price,
            "sale_price": product.sale_price,
            "category_id": product.category_id,
            "category": {"id": product.category.id, "name": product.category.name} if product.category else None,
            "images": product.images or [],
            "stock_quantity": product.stock_quantity,
            "is_active": product.is_active,
            "is_featured": product.is_featured,
            "created_at": product.created_at,
            "updated_at": product.updated_at
        })
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.post("/products", response_model=ProductResponse, status_code=201)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new product"""
    # Validate category if provided
    if product_data.category_id:
        category_result = await db.execute(
            select(ProductCategory).where(ProductCategory.id == product_data.category_id)
        )
        category = category_result.scalar_one_or_none()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

    # Ensure SKU and slug uniqueness
    duplicate_result = await db.execute(
        select(Product).where(
            or_(Product.slug == product_data.slug, Product.sku == product_data.sku)
        )
    )
    duplicate = duplicate_result.scalar_one_or_none()
    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="A product with this SKU or slug already exists"
        )

    product = Product(**product_data.model_dump())
    if product.images is None:
        product.images = []

    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update an existing product"""
    try:
        print(f"[UPDATE] Starting update of product {product_id}")
        print(f"[UPDATE] Incoming data: {product_data.model_dump(exclude_unset=True)}")
        
        result = await db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()

        if not product:
            print(f"[UPDATE] Product {product_id} not found")
            raise HTTPException(status_code=404, detail="Product not found")

        print(f"[UPDATE] Found product: {product.name}")
        update_data = product_data.model_dump(exclude_unset=True)

        # Validate category change
        if "category_id" in update_data and update_data["category_id"] is not None:
            category_result = await db.execute(
                select(ProductCategory).where(ProductCategory.id == update_data["category_id"])
            )
            category = category_result.scalar_one_or_none()
            if not category:
                print(f"[UPDATE] Category {update_data['category_id']} not found")
                raise HTTPException(status_code=404, detail="Category not found")

        # Apply updates
        print(f"[UPDATE] Applying updates to product")
        for field, value in update_data.items():
            print(f"[UPDATE] Setting {field} = {value}")
            setattr(product, field, value)

        await db.flush()  # Flush before commit to catch any issues
        await db.commit()
        await db.refresh(product)
        print(f"[UPDATE] ✅ Product {product_id} updated successfully")
        return product
    except Exception as e:
        await db.rollback()
        print(f"[UPDATE] ❌ Error updating product: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to update product: {str(e)}")


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a product and all related records"""
    try:
        print(f"[DELETE] Starting deletion of product {product_id}")
        
        # Get the product (this will trigger cascade delete on related objects)
        result = await db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()
        
        if not product:
            print(f"[DELETE] Product {product_id} not found")
            raise HTTPException(status_code=404, detail="Product not found")

        print(f"[DELETE] Found product: {product.name}")
        
        # Delete the product using session.delete which triggers cascades
        await db.delete(product)
        print(f"[DELETE] Marked product for deletion, committing...")
        
        # Commit the transaction
        await db.commit()
        print(f"[DELETE] ✅ Product {product_id} and all related records deleted successfully")
        return {"message": "Product deleted successfully", "id": product_id}
    except Exception as e:
        await db.rollback()
        print(f"[DELETE] ❌ Error deleting product: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to delete product: {str(e)}")


# ========== Categories ==========

@router.get("/categories", response_model=PaginatedResponse)
async def list_categories(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List product categories with pagination"""
    
    query = select(ProductCategory).options(selectinload(ProductCategory.parent))
    
    if search:
        query = query.where(
            (ProductCategory.name.ilike(f"%{search}%")) |
            (ProductCategory.slug.ilike(f"%{search}%"))
        )
    
    # Handle is_active filter - convert string to boolean if provided
    if is_active and is_active.lower() in ('true', 'false'):
        is_active_bool = is_active.lower() == 'true'
        query = query.where(ProductCategory.is_active == is_active_bool)
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.order_by(ProductCategory.order_index).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    categories = result.scalars().all()
    
    # Add product count for each category
    items_with_count = []
    for category in categories:
        product_count_query = select(func.count(Product.id)).where(Product.category_id == category.id)
        product_count_result = await db.execute(product_count_query)
        product_count = product_count_result.scalar()
        
        # Serialize parent category if exists
        parent_data = None
        if category.parent:
            parent_data = {
                "id": category.parent.id,
                "name": category.parent.name,
                "slug": category.parent.slug,
            }
        
        category_dict = {
            "id": category.id,
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
            "parent_id": category.parent_id,
            "parent": parent_data,
            "image_url": category.image_url,
            "order_index": category.order_index,
            "is_active": category.is_active,
            "created_at": category.created_at,
            "product_count": product_count
        }
        items_with_count.append(category_dict)
    
    return {
        "items": items_with_count,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.post("/categories", response_model=ProductCategoryResponse, status_code=201)
async def create_category(
    category_data: ProductCategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new product category"""
    # Validate parent category
    if category_data.parent_id:
        parent_result = await db.execute(
            select(ProductCategory).where(ProductCategory.id == category_data.parent_id)
        )
        parent = parent_result.scalar_one_or_none()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")

    # Ensure slug uniqueness
    existing_result = await db.execute(
        select(ProductCategory).where(ProductCategory.slug == category_data.slug)
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")

    category = ProductCategory(**category_data.model_dump())
    if category.order_index is None:
        category.order_index = 0

    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=ProductCategoryResponse)
async def update_category(
    category_id: int,
    category_data: ProductCategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a category"""
    result = await db.execute(select(ProductCategory).where(ProductCategory.id == category_id))
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = category_data.model_dump(exclude_unset=True)

    if "parent_id" in update_data and update_data["parent_id"]:
        parent_result = await db.execute(
            select(ProductCategory).where(ProductCategory.id == update_data["parent_id"])
        )
        parent = parent_result.scalar_one_or_none()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")
        if update_data["parent_id"] == category_id:
            raise HTTPException(status_code=400, detail="Category cannot be its own parent")

    if "slug" in update_data:
        slug_check_result = await db.execute(
            select(ProductCategory).where(
                ProductCategory.slug == update_data["slug"],
                ProductCategory.id != category_id
            )
        )
        slug_conflict = slug_check_result.scalar_one_or_none()
        if slug_conflict:
            raise HTTPException(status_code=400, detail="Category slug already exists")

    for field, value in update_data.items():
        setattr(category, field, value)

    await db.commit()
    await db.refresh(category)
    return category


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a category"""
    result = await db.execute(select(ProductCategory).where(ProductCategory.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has products
    product_count_query = select(func.count(Product.id)).where(Product.category_id == category_id)
    product_count_result = await db.execute(product_count_query)
    product_count = product_count_result.scalar()
    
    if product_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category with {product_count} associated products"
        )
    
    await db.delete(category)
    await db.commit()
    return {"message": "Category deleted successfully"}


# ========== Stock Management ==========

@router.get("/stock", response_model=PaginatedResponse)
async def get_stock_levels(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    stock_status: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get stock levels for all products"""
    from app.models.models import ProductCategory
    
    # Convert category_id from string to int if provided and valid
    category_id_int = None
    if category_id and category_id.strip():
        try:
            category_id_int = int(category_id)
        except ValueError:
            pass
    
    query = select(Product).options(selectinload(Product.category))
    
    if search and search.strip():
        query = query.where(
            (Product.name.ilike(f"%{search}%")) | 
            (Product.sku.ilike(f"%{search}%"))
        )
    
    if category_id_int:
        query = query.where(Product.category_id == category_id_int)
    
    if stock_status == "out":
        query = query.where(Product.stock_quantity == 0)
    elif stock_status == "low":
        query = query.where((Product.stock_quantity > 0) & (Product.stock_quantity < 10))
    elif stock_status == "in":
        query = query.where(Product.stock_quantity >= 10)
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.order_by(Product.stock_quantity).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    products = result.scalars().all()
    
    # Format as stock items
    items = []
    for product in products:
        items.append({
            "id": product.id,
            "product_id": product.id,
            "product": {
                "id": product.id,
                "name": product.name,
                "sku": product.sku,
                "slug": product.slug,
                "category": {"name": product.category.name} if product.category else None,
                "stock_quantity": product.stock_quantity,
                "updated_at": product.updated_at
            },
            "quantity": product.stock_quantity,
            "last_updated": product.updated_at
        })
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.put("/stock/{product_id}")
async def update_stock(
    product_id: int,
    payload: StockUpdateRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update stock quantity for a product and record movement"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    before_qty = product.stock_quantity or 0
    product.stock_quantity = payload.quantity
    product.updated_at = datetime.utcnow()

    movement = StockMovement(
        product_id=product.id,
        user_id=current_user.id if current_user else None,
        change=payload.quantity - before_qty,
        quantity_before=before_qty,
        quantity_after=payload.quantity,
        reason=payload.reason or "manual_adjustment",
        note=payload.note,
    )
    db.add(movement)
    
    await db.commit()
    await db.refresh(product)
    await db.refresh(movement)
    
    return {
        "message": "Stock updated successfully",
        "product_id": product_id,
        "new_quantity": payload.quantity,
        "movement_id": movement.id
    }


@router.get("/stock/movements", response_model=PaginatedResponse)
async def list_stock_movements(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    product_id: Optional[int] = None,
    reason: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List stock movements with filters"""
    base_query = (
        select(StockMovement, Product)
        .join(Product, StockMovement.product_id == Product.id)
        .order_by(StockMovement.created_at.desc())
    )

    if product_id:
        base_query = base_query.where(StockMovement.product_id == product_id)
    if reason:
        base_query = base_query.where(StockMovement.reason.ilike(f"%{reason}%"))
    if search:
        base_query = base_query.where(
            (Product.name.ilike(f"%{search}%")) |
            (Product.sku.ilike(f"%{search}%"))
        )

    count_query = select(func.count()).select_from(base_query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    paged = base_query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(paged)
    rows = result.all()

    items = []
    for movement, product in rows:
        items.append({
            "id": movement.id,
            "product_id": movement.product_id,
            "product_name": product.name if product else None,
            "sku": product.sku if product else None,
            "change": movement.change,
            "quantity_before": movement.quantity_before,
            "quantity_after": movement.quantity_after,
            "reason": movement.reason,
            "note": movement.note,
            "user_email": None,  # Filled if needed via join later
            "created_at": movement.created_at,
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.post("/stock/bulk-adjust")
async def bulk_adjust_stock(
    payload: StockBulkAdjustmentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Apply multiple stock adjustments in one batch"""
    if not payload.items:
        raise HTTPException(status_code=400, detail="No adjustment items provided")

    summary = []

    try:
        for item in payload.items:
            product_result = await db.execute(select(Product).where(Product.sku == item.sku))
            product = product_result.scalar_one_or_none()

            if not product:
                raise HTTPException(status_code=404, detail=f"Product with SKU {item.sku} not found")

            before_qty = product.stock_quantity or 0
            after_qty = before_qty + item.delta
            if after_qty < 0:
                raise HTTPException(status_code=400, detail=f"Adjustment would make stock negative for {item.sku}")

            product.stock_quantity = after_qty
            product.updated_at = datetime.utcnow()

            movement = StockMovement(
                product_id=product.id,
                user_id=current_user.id if current_user else None,
                change=item.delta,
                quantity_before=before_qty,
                quantity_after=after_qty,
                reason=item.reason or "bulk_adjustment",
                note=item.note,
            )
            db.add(movement)

            summary.append({
                "sku": item.sku,
                "product_id": product.id,
                "before": before_qty,
                "after": after_qty,
                "delta": item.delta,
            })

        await db.commit()
    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        raise

    return {
        "message": "Bulk stock adjustment applied",
        "updated": len(summary),
        "items": summary
    }


# ========== Image Uploads ==========

@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin)
):
    """Upload an image file"""
    try:
        print(f"[UPLOAD] Starting image upload: {file.filename}")
        
        # Validate file type (include common aliases from various browsers)
        allowed_types = {
            "image/jpeg",
            "image/jpg",      # alias seen in some UAs
            "image/pjpeg",    # progressive JPEG (legacy IE/old UAs)
            "image/png",
            "image/x-png",    # legacy alias
            "image/gif",
            "image/webp",
        }
        
        if file.content_type not in allowed_types:
            print(f"[UPLOAD] Invalid file type: {file.content_type}")
            raise HTTPException(status_code=400, detail="Only image files are allowed (JPEG, PNG, GIF, WebP)")
        
        # Validate file size (max 5MB) without loading entire file into memory
        max_size = 5 * 1024 * 1024
        file_content = await file.read()
        print(f"[UPLOAD] File size: {len(file_content)} bytes")
        
        if len(file_content) > max_size:
            print(f"[UPLOAD] File too large")
            raise HTTPException(status_code=400, detail="File size must be less than 5MB")
        
        # Create uploads directory if it doesn't exist
        upload_dir = Path("/var/www/citricloud.com/uploads")
        print(f"[UPLOAD] Upload directory: {upload_dir}")
        print(f"[UPLOAD] Directory exists: {upload_dir.exists()}")
        
        try:
            upload_dir.mkdir(parents=True, exist_ok=True)
            print(f"[UPLOAD] Directory ready for upload")
        except Exception as dir_err:
            print(f"[UPLOAD] ❌ Failed to create upload directory: {str(dir_err)}")
            raise HTTPException(status_code=500, detail=f"Failed to create upload directory: {str(dir_err)}")
        
        # Generate unique filename
        file_ext = Path(file.filename).suffix
        unique_filename = f"{secrets.token_hex(16)}{file_ext}"
        file_path = upload_dir / unique_filename
        
        print(f"[UPLOAD] Saving to: {file_path}")
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        print(f"[UPLOAD] File saved, setting permissions")
        
        # Set proper file permissions
        file_path.chmod(0o644)
        
        # Return the URL path
        image_url = f"/uploads/{unique_filename}"
        
        print(f"[UPLOAD] ✅ Image uploaded successfully: {unique_filename}")
        
        return {
            "success": True,
            "filename": unique_filename,
            "image_url": image_url
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[UPLOAD] ❌ Error uploading image: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


