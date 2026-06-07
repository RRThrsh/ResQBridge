import jsPDF from 'jspdf'
import 'jspdf-autotable'
import type { AdminStoredReport } from './reports'
import { formatReportType, statusLabel } from './reports'
import { formatDateTime } from './dates'

export function generateReportPdf(report: AdminStoredReport) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFontSize(16)
  doc.text('Palawan Wildlife Rescue & Rehabilitation Center', pageWidth / 2, 20, { align: 'center' })
  doc.setFontSize(10)
  doc.text('Incident Report', pageWidth / 2, 28, { align: 'center' })

  if (report.reportNumber) {
    doc.setFontSize(9)
    doc.text(`Report #: ${report.reportNumber}`, 14, 38)
  }

  doc.setFontSize(10)
  let y = report.reportNumber ? 45 : 38

  const fields: [string, string][] = [
    ['Animal Name', report.animalName],
    ['Category', report.category === 'wildlife' ? 'Wildlife' : 'Domestic'],
    ['Type', formatReportType(report.type)],
    ['Status', statusLabel(report.status)],
    ['Location', report.location],
    ['Description', report.description ?? 'N/A'],
    ['Date Reported', formatDateTime(report.createdAt)],
    ['Reporter Name', `${report.reporterFirstName} ${report.reporterLastName}`],
    ['Reporter Phone', report.reporterPhone ?? report.phone ?? 'N/A'],
    ['Reporter Email', report.userEmail],
  ]

  if (report.category === 'wildlife') {
    fields.push(['Condition', report.condition ?? 'N/A'])
    fields.push(['Behavior', report.behavior ?? 'N/A'])
    if (report.speciesId) fields.push(['Species ID', report.speciesId])
    if (report.quantity) fields.push(['Quantity', String(report.quantity)])
    if (report.reportedSize) fields.push(['Size', report.reportedSize])
  }

  if (report.assignedRescuerName) {
    fields.push(['Assigned Rescuer', report.assignedRescuerName])
  }

  if (report.latitude && report.longitude) {
    fields.push(['Coordinates', `${report.latitude}, ${report.longitude}`])
  }

  const body = fields.map(([label, value]) => [label, value])

  doc.autoTable({
    startY: y,
    head: [['Field', 'Value']],
    body,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 163, 74] },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  })

  doc.save(`report-${report.reportNumber ?? report.id}.pdf`)
}
