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
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 10;

    // Title
    doc.setFontSize(16);
    doc.text('Property Analysis Report', 105, yPos, { align: 'center' });
    yPos += 20;

    // Metrics
    doc.setFontSize(12);
    const metrics = [
      { label: 'Total Startup Cost', value: results.totalStartupCost },
      { label: 'Months to Repay', value: results.monthsToRepay },
      { label: 'Percent of Debt Repaid Monthly', value: results.percentDebtRepaidMonthly },
      { label: 'Annual ROI After Debt Repaid', value: results.annualROI },
      { label: 'Net Annual Income After Debt Repaid', value: results.netAnnualIncome },
      { label: 'Net Monthly Income After Debt Repaid', value: results.netMonthlyIncome }
    ];

    metrics.forEach(metric => {
      // Check if we need a new page
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(`${metric.label}: ${formatValue(metric.value)}`, margin, yPos);
      yPos += lineHeight;
    });

    // AI Analysis
    if (results.aiAnalysis) {
      yPos += lineHeight; // Add extra spacing before AI analysis

      // Check if we need a new page
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }

      doc.text('AI Analysis:', margin, yPos);
      yPos += lineHeight;

      // Split the AI analysis text into lines that fit the page width
      const maxWidth = doc.internal.pageSize.width - (margin * 2);
      const splitText = doc.splitTextToSize(results.aiAnalysis, maxWidth);

      // Add text line by line, creating new pages as needed
      splitText.forEach(line => {
        if (yPos > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(line, margin, yPos);
        yPos += lineHeight;
      });
    }

    doc.save('property-analysis.pdf');
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
