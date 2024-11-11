import { jsPDF } from 'jspdf';

export default function AnalysisResults({ results }) {
  const formatValue = (value) => {
    if (!value) return 'N/A';
    if (typeof value === 'object' && value.value) {
      return value.value;
    }
    return value;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 10;
    const contentWidth = pageWidth - (margin * 2);

    // Header styling
    doc.setFillColor(52, 144, 220); // Blue header
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Property Analysis Report', pageWidth / 2, 25, { align: 'center' });

    // Reset text color for content
    doc.setTextColor(0, 0, 0);
    yPos = 50;

    // Location info
    doc.setFontSize(16);
    doc.text(`Location: ${results.location}`, margin, yPos);
    yPos += lineHeight * 2;

    // Financial Metrics Section
    doc.setFontSize(14);
    doc.setTextColor(52, 144, 220);
    doc.text('Financial Metrics', margin, yPos);
    doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
    yPos += lineHeight * 2;

    // Reset text color
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    const metrics = [
      { label: 'Total Startup Cost', value: `$${formatValue(results.totalStartupCost)}` },
      { label: 'Months to Repay', value: `${formatValue(results.monthsToRepay)} months` },
      { label: 'Monthly Debt Repayment', value: `${formatValue(results.percentDebtRepaidMonthly)}%` },
      { label: 'Annual ROI', value: `${formatValue(results.annualROI)}%` },
      { label: 'Net Annual Income', value: `$${formatValue(results.netAnnualIncome)}` },
      { label: 'Net Monthly Income', value: `$${formatValue(results.netMonthlyIncome)}` }
    ];

    metrics.forEach(metric => {
      if (yPos > pageHeight - margin * 4) {
        doc.addPage();
        yPos = margin;
      }
      
      // Label in bold
      doc.setFont(undefined, 'bold');
      doc.text(metric.label + ':', margin, yPos);
      
      // Value in normal font
      doc.setFont(undefined, 'normal');
      doc.text(metric.value, margin + 80, yPos);
      
      yPos += lineHeight * 1.5;
    });

    // AI Analysis Section
    if (results.aiAnalysis) {
      yPos += lineHeight;

      if (yPos > pageHeight - margin * 4) {
        doc.addPage();
        yPos = margin;
      }

      // AI Analysis header
      doc.setFontSize(14);
      doc.setTextColor(52, 144, 220);
      doc.text('AI Analysis', margin, yPos);
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      yPos += lineHeight * 2;

      // Reset text color and size for analysis content
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);

      const splitText = doc.splitTextToSize(results.aiAnalysis, contentWidth);
      splitText.forEach(line => {
        if (yPos > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(line, margin, yPos);
        yPos += lineHeight;
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    doc.save('property-analysis-report.pdf');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Property Analysis Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Total Startup Cost</h3>
          <p className="text-lg">${formatValue(results.totalStartupCost)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Months to Repay</h3>
          <p className="text-lg">{formatValue(results.monthsToRepay)} months</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Percent of Debt Repaid Monthly</h3>
          <p className="text-lg">{formatValue(results.percentDebtRepaidMonthly)}%</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Annual ROI After Debt Repaid</h3>
          <p className="text-lg">{formatValue(results.annualROI)}%</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Net Annual Income After Debt Repaid</h3>
          <p className="text-lg">${formatValue(results.netAnnualIncome)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Net Monthly Income After Debt Repaid</h3>
          <p className="text-lg">${formatValue(results.netMonthlyIncome)}</p>
        </div>
      </div>

      {results.aiAnalysis && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">AI Analysis</h3>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{results.aiAnalysis}</p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}
