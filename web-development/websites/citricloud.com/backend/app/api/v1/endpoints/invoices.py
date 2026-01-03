"""
Invoice management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from pydantic import BaseModel
import json
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from fastapi.responses import StreamingResponse

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.models import Invoice, Order, OrderItem, Product, User, InvoiceStatus

router = APIRouter()


# ========== Schemas ==========

class InvoiceItemResponse(BaseModel):
    """Invoice item schema"""
    id: int
    product_name: str
    quantity: int
    unit_price: float
    total_price: float
    product_id: Optional[int] = None
    
    class Config:
        from_attributes = True


class OrderDetailResponse(BaseModel):
    """Order detail for invoice"""
    order_number: str
    order_status: str
    order_created_at: datetime
    
    class Config:
        from_attributes = True


class InvoiceResponse(BaseModel):
    """Invoice response schema"""
    id: int
    invoice_number: str
    order_id: int
    status: str
    amount: float
    tax_amount: float
    total_amount: float
    currency: str
    due_date: Optional[datetime]
    paid_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    notes: Optional[str]
    items: List[InvoiceItemResponse] = []
    order_detail: Optional[OrderDetailResponse] = None
    
    class Config:
        from_attributes = True


class InvoiceListResponse(BaseModel):
    """Invoice list with pagination"""
    invoices: List[InvoiceResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class InvoiceFilterRequest(BaseModel):
    """Invoice filter request"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    search: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None


# ========== Routes ==========

@router.get("", response_model=InvoiceListResponse)
async def get_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's invoices with filtering and pagination"""
    
    # Base query - get invoices for orders belonging to current user
    # For system admins, show all invoices; for regular users, only their own
    user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value
    if user_role == "SYSTEM_ADMIN":
        query = select(Invoice)
    else:
        query = select(Invoice).join(Order).where(Order.user_id == current_user.id)
    
    # Apply filters
    filters = []
    
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            filters.append(Invoice.created_at >= start_dt)
        except ValueError:
            pass
    
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
            # Add one day to include the entire end date
            end_dt = end_dt.replace(hour=23, minute=59, second=59)
            filters.append(Invoice.created_at <= end_dt)
        except ValueError:
            pass
    
    if status and status in [s.value for s in InvoiceStatus]:
        filters.append(Invoice.status == status)
    
    if search:
        filters.append(
            or_(
                Invoice.invoice_number.ilike(f"%{search}%"),
                Invoice.notes.ilike(f"%{search}%")
            )
        )
    
    if min_amount is not None:
        filters.append(Invoice.total_amount >= min_amount)
    
    if max_amount is not None:
        filters.append(Invoice.total_amount <= max_amount)
    
    if filters:
        query = query.where(and_(*filters))
    
    # Get total count
    user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value
    if user_role == "SYSTEM_ADMIN":
        count_query = select(Invoice)
    else:
        count_query = select(Invoice).join(Order).where(Order.user_id == current_user.id)
    if filters:
        count_query = count_query.where(and_(*filters))
    total_result = await db.execute(count_query)
    total = len(total_result.all())
    
    # Apply pagination and sorting
    query = query.order_by(Invoice.created_at.desc())
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    invoices = result.scalars().all()
    
    # Build response with items
    invoice_responses = []
    for invoice in invoices:
        # Get order items for this invoice
        order_result = await db.execute(
            select(OrderItem).where(OrderItem.order_id == invoice.order_id)
        )
        items = order_result.scalars().all()
        
        items_response = []
        for item in items:
            product_result = await db.execute(
                select(Product).where(Product.id == item.product_id)
            )
            product = product_result.scalar_one_or_none()
            items_response.append(InvoiceItemResponse(
                id=item.id,
                product_name=product.name if product else f"Product #{item.product_id}",
                quantity=item.quantity,
                unit_price=item.unit_price,
                total_price=item.total_price,
                product_id=item.product_id
            ))
        
        # Get order details
        order_detail_result = await db.execute(
            select(Order).where(Order.id == invoice.order_id)
        )
        order = order_detail_result.scalar_one_or_none()
        order_detail = None
        if order:
            order_detail = OrderDetailResponse(
                order_number=order.order_number,
                order_status=order.status.value,
                order_created_at=order.created_at
            )
        
        invoice_responses.append(InvoiceResponse(
            **{
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'order_id': invoice.order_id,
                'status': invoice.status.value,
                'amount': invoice.amount,
                'tax_amount': invoice.tax_amount,
                'total_amount': invoice.total_amount,
                'currency': invoice.currency,
                'due_date': invoice.due_date,
                'paid_date': invoice.paid_date,
                'created_at': invoice.created_at,
                'updated_at': invoice.updated_at,
                'notes': invoice.notes,
                'items': items_response,
                'order_detail': order_detail
            }
        ))
    
    total_pages = (total + page_size - 1) // page_size
    
    return InvoiceListResponse(
        invoices=invoice_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific invoice"""
    
    # Verify invoice belongs to current user or user is system admin
    user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value
    if user_role == "SYSTEM_ADMIN":
        result = await db.execute(
            select(Invoice).where(Invoice.id == invoice_id)
        )
    else:
        result = await db.execute(
            select(Invoice)
            .join(Order)
            .where(
                and_(
                    Invoice.id == invoice_id,
                    Order.user_id == current_user.id
                )
            )
        )
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Get order items
    order_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == invoice.order_id)
    )
    items = order_result.scalars().all()
    
    items_response = []
    for item in items:
        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()
        items_response.append(InvoiceItemResponse(
            id=item.id,
            product_name=product.name if product else f"Product #{item.product_id}",
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price,
            product_id=item.product_id
        ))
    
    # Get order details
    order_detail_result = await db.execute(
        select(Order).where(Order.id == invoice.order_id)
    )
    order = order_detail_result.scalar_one_or_none()
    order_detail = None
    if order:
        order_detail = OrderDetailResponse(
            order_number=order.order_number,
            order_status=order.status.value,
            order_created_at=order.created_at
        )
    
    return InvoiceResponse(
        id=invoice.id,
        invoice_number=invoice.invoice_number,
        order_id=invoice.order_id,
        status=invoice.status.value,
        amount=invoice.amount,
        tax_amount=invoice.tax_amount,
        total_amount=invoice.total_amount,
        currency=invoice.currency,
        due_date=invoice.due_date,
        paid_date=invoice.paid_date,
        created_at=invoice.created_at,
        updated_at=invoice.updated_at,
        notes=invoice.notes,
        items=items_response,
        order_detail=order_detail
    )


@router.post("/{invoice_id}/mark-paid")
async def mark_invoice_paid(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark an invoice as paid"""
    
    # Verify invoice belongs to current user or user is system admin
    user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value
    if user_role == "SYSTEM_ADMIN":
        result = await db.execute(
            select(Invoice).where(Invoice.id == invoice_id)
        )
    else:
        result = await db.execute(
            select(Invoice)
            .join(Order)
            .where(
                and_(
                    Invoice.id == invoice_id,
                    Order.user_id == current_user.id
                )
            )
        )
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    invoice.status = InvoiceStatus.PAID
    invoice.paid_date = datetime.utcnow()
    db.add(invoice)
    await db.commit()
    
    return {"message": "Invoice marked as paid", "invoice_id": invoice_id}


@router.post("/{invoice_id}/resend")
async def resend_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Resend an invoice email"""
    
    # Verify invoice belongs to current user or user is system admin
    user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value
    if user_role == "SYSTEM_ADMIN":
        result = await db.execute(
            select(Invoice).where(Invoice.id == invoice_id)
        )
    else:
        result = await db.execute(
            select(Invoice)
            .join(Order)
            .where(
                and_(
                    Invoice.id == invoice_id,
                    Order.user_id == current_user.id
                )
            )
        )
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    invoice.status = InvoiceStatus.SENT
    db.add(invoice)
    await db.commit()
    
    # TODO: Implement actual email sending here
    return {"message": "Invoice resent successfully", "invoice_id": invoice_id}


@router.get("/{invoice_id}/download")
async def download_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Download invoice as PDF"""
    
    # Verify invoice belongs to current user
    result = await db.execute(
        select(Invoice)
        .join(Order)
        .where(
            and_(
                Invoice.id == invoice_id,
                Order.user_id == current_user.id
            )
        )
    )
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Get order items
    order_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == invoice.order_id)
    )
    items = order_result.scalars().all()
    
    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12
    )
    
    # Title
    elements.append(Paragraph("INVOICE", title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Invoice details
    details_data = [
        ["Invoice Number:", invoice.invoice_number],
        ["Date:", invoice.created_at.strftime("%Y-%m-%d")],
        ["Status:", invoice.status.value.upper()],
        ["Currency:", invoice.currency],
    ]
    
    if invoice.due_date:
        details_data.append(["Due Date:", invoice.due_date.strftime("%Y-%m-%d")])
    
    if invoice.paid_date:
        details_data.append(["Paid Date:", invoice.paid_date.strftime("%Y-%m-%d")])
    
    details_table = Table(details_data, colWidths=[2*inch, 3*inch])
    details_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f9ff')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    elements.append(details_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Items table
    elements.append(Paragraph("Items", heading_style))
    
    items_data = [["Product", "Quantity", "Unit Price", "Total"]]
    for item in items:
        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()
        items_data.append([
            product.name if product else f"Product #{item.product_id}",
            str(item.quantity),
            f"${item.unit_price:.2f}",
            f"${item.total_price:.2f}"
        ])
    
    items_table = Table(items_data, colWidths=[2.5*inch, 1.2*inch, 1.2*inch, 1.2*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Summary
    summary_data = [
        ["Subtotal:", f"${invoice.amount:.2f}"],
        ["Tax:", f"${invoice.tax_amount:.2f}"],
        ["Total:", f"${invoice.total_amount:.2f}"]
    ]
    
    summary_table = Table(summary_data, colWidths=[4.5*inch, 1.5*inch])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, -1), (-1, -1), 12),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, -1), (-1, -1), colors.whitesmoke),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(summary_table)
    
    if invoice.notes:
        elements.append(Spacer(1, 0.2*inch))
        elements.append(Paragraph("Notes:", heading_style))
        elements.append(Paragraph(invoice.notes, styles['Normal']))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        BytesIO(buffer.getvalue()),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice-{invoice.invoice_number}.pdf"}
    )


@router.get("/statistics/summary")
async def get_invoice_statistics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get invoice statistics for dashboard"""
    
    # Get all invoices for current user
    result = await db.execute(
        select(Invoice)
        .join(Order)
        .where(Order.user_id == current_user.id)
    )
    invoices = result.scalars().all()
    
    total_invoices = len(invoices)
    paid_invoices = sum(1 for inv in invoices if inv.status == InvoiceStatus.PAID)
    pending_invoices = sum(1 for inv in invoices if inv.status == InvoiceStatus.SENT)
    overdue_invoices = sum(1 for inv in invoices if inv.status == InvoiceStatus.OVERDUE)
    
    total_amount = sum(inv.total_amount for inv in invoices)
    paid_amount = sum(inv.total_amount for inv in invoices if inv.status == InvoiceStatus.PAID)
    pending_amount = sum(inv.total_amount for inv in invoices if inv.status in [InvoiceStatus.SENT, InvoiceStatus.DRAFT])
    
    return {
        "total_invoices": total_invoices,
        "paid_invoices": paid_invoices,
        "pending_invoices": pending_invoices,
        "overdue_invoices": overdue_invoices,
        "total_amount": total_amount,
        "paid_amount": paid_amount,
        "pending_amount": pending_amount,
        "currency": "USD"
    }
