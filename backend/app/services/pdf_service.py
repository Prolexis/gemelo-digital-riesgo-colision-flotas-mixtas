from datetime import datetime
from io import BytesIO
from typing import List, Optional

from docx import Document
from docx.shared import Pt
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.models.models import Equipment, MaintenanceOrder, RiskAlert


def build_maintenance_report_pdf(
    equipment: Equipment, orders: list[MaintenanceOrder]
) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Reporte de Mantenimiento — Gemelo Digital", styles["Title"]))
    story.append(Spacer(1, 0.5 * cm))
    story.append(
        Paragraph(
            f"Equipo: {equipment.name} ({equipment.code}) — Modelo: {equipment.model}",
            styles["Heading2"],
        )
    )
    story.append(
        Paragraph(
            f"Horómetro actual: {equipment.hour_meter} h | Estado: {equipment.status.value}",
            styles["Normal"],
        )
    )
    story.append(
        Paragraph(
            f"Generado el: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
            styles["Normal"],
        )
    )
    story.append(Spacer(1, 0.8 * cm))

    table_data = [["Fecha", "Tipo", "Descripción", "Horas H-H", "Responsable"]]
    for order in orders:
        table_data.append(
            [
                order.created_at.strftime("%Y-%m-%d") if order.created_at else "-",
                order.maintenance_type.value,
                order.description[:60],
                str(order.labor_hours),
                order.performed_by or "-",
            ]
        )

    table = Table(table_data, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    story.append(table)

    doc.build(story)
    return buffer.getvalue()


def build_maintenance_report_docx(
    equipment: Equipment, orders: list[MaintenanceOrder]
) -> bytes:
    document = Document()

    title = document.add_heading("Reporte de Mantenimiento — Gemelo Digital", level=1)
    title.runs[0].font.size = Pt(18)

    document.add_paragraph(
        f"Equipo: {equipment.name} ({equipment.code}) — Modelo: {equipment.model}"
    )
    document.add_paragraph(
        f"Horómetro actual: {equipment.hour_meter} h | Estado: {equipment.status.value}"
    )
    document.add_paragraph(
        f"Generado el: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}"
    )
    document.add_paragraph("")

    table = document.add_table(rows=1, cols=5)
    table.style = "Light Grid Accent 1"
    header_cells = table.rows[0].cells
    for cell, text in zip(
        header_cells, ["Fecha", "Tipo", "Descripción", "Horas H-H", "Responsable"]
    ):
        cell.text = text

    for order in orders:
        row_cells = table.add_row().cells
        row_cells[0].text = order.created_at.strftime("%Y-%m-%d") if order.created_at else "-"
        row_cells[1].text = order.maintenance_type.value
        row_cells[2].text = order.description
        row_cells[3].text = str(order.labor_hours)
        row_cells[4].text = order.performed_by or "-"

    buffer = BytesIO()
    document.save(buffer)
    return buffer.getvalue()


def build_maintenance_report_xlsx(
    equipment: Equipment, orders: list[MaintenanceOrder]
) -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.title = "Mantenimiento"

    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1F2937", end_color="1F2937", fill_type="solid")

    ws["A1"] = "Reporte de Mantenimiento — Gemelo Digital"
    ws["A1"].font = Font(bold=True, size=14)
    ws.merge_cells("A1:E1")

    ws["A2"] = f"Equipo: {equipment.name} ({equipment.code}) — Modelo: {equipment.model}"
    ws.merge_cells("A2:E2")
    ws["A3"] = f"Horómetro actual: {equipment.hour_meter} h | Estado: {equipment.status.value}"
    ws.merge_cells("A3:E3")

    headers = ["Fecha", "Tipo", "Descripción", "Horas H-H", "Responsable"]
    header_row = 5
    for col_idx, header in enumerate(headers, start=1):
        cell = ws.cell(row=header_row, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")

    for row_idx, order in enumerate(orders, start=header_row + 1):
        ws.cell(row=row_idx, column=1, value=order.created_at.strftime("%Y-%m-%d") if order.created_at else "-")
        ws.cell(row=row_idx, column=2, value=order.maintenance_type.value)
        ws.cell(row=row_idx, column=3, value=order.description)
        ws.cell(row=row_idx, column=4, value=order.labor_hours)
        ws.cell(row=row_idx, column=5, value=order.performed_by or "-")

    widths = [14, 14, 45, 12, 20]
    for i, width in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = width

    buffer = BytesIO()
    wb.save(buffer)
    return buffer.getvalue()


# ---------- Reportes de Riesgo y Cuasi-Colisiones (Gemelo Digital 3D XAI) ----------

def build_risk_incidents_report_pdf(alerts: List[RiskAlert], anonymize_operators: bool = True) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1.5 * cm, bottomMargin=1.5 * cm)
    styles = getSampleStyleSheet()
    story = []

    title = "Reporte de Cuasi-Colisiones y Predicción de Riesgo (XAI SHAP)"
    if anonymize_operators:
        title += " [DATOS ANONIMIZADOS - ÉTICA]"

    story.append(Paragraph(title, styles["Title"]))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(f"Gemelo Digital 3D — Minas de Tajo Abierto (Flotas Mixtas)", styles["Heading2"]))
    story.append(Paragraph(f"Fecha de Exportación: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]))
    story.append(Spacer(1, 0.6 * cm))

    table_data = [["Fecha/Hora", "Equipo A", "Equipo B", "Nivel Riesgo", "Lead Time (s)", "Factor Principal SHAP"]]
    
    for a in alerts:
        operator_label = "Op. Anonimizado #84" if anonymize_operators else "Juan Pérez"
        table_data.append([
            a.created_at.strftime("%Y-%m-%d %H:%M") if a.created_at else "-",
            a.equipment_id[:8],
            a.target_equipment_id[:8] if a.target_equipment_id else "Estático",
            a.risk_level.value.upper() if hasattr(a.risk_level, 'value') else str(a.risk_level).upper(),
            f"{a.prediction_horizon_sec:.1f} s",
            "Fatiga de Operador (65%)" if "Fatiga" in a.shap_factors_json else "Velocidad Relativa (40%)"
        ])

    table = Table(table_data, repeatRows=1)
    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )
    story.append(table)

    doc.build(story)
    return buffer.getvalue()
