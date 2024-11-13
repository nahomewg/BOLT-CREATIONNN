import { jsPDF } from 'jspdf';

export default function AnalysisResults({ results }) {
  const formatValue = (value) => {
    try {
      if (value === undefined || value === null) return 'N/A';
      if (typeof value === 'object' && value.value) {
        return isNaN(value.value) ? 'N/A' : value.value;
      }
      return isNaN(value) ? 'N/A' : value;
    } catch (error) {
      console.error('Error formatting value:', error);
      return 'N/A';
    }
  };

  const handleExportPDF = async () => {
    try {
      if (!results) {
        throw new Error('No results available to export');
      }

      const doc = new jsPDF();
      let yPos = 20;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 10;
      const contentWidth = pageWidth - (margin * 2);

      // Header
      doc.setFillColor(52, 144, 220);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      
      try {
        doc.text('Property Analysis Report', pageWidth / 2, 25, { align: 'center' });
      } catch (error) {
        console.error('Error writing header:', error);
        throw new Error('Failed to write PDF header');
      }

      // Content
      doc.setTextColor(0, 0, 0);
      yPos = 50;

      // Safely write location
      const location = results.location || 'Location not specified';
      doc.setFontSize(16);
      doc.text(`Location: ${location}`, margin, yPos);
      yPos += lineHeight * 2;

      // Financial Metrics
      const metrics = [
        { label: 'Total Startup Cost', value: `$${formatValue(results.totalStartupCost)}` },
        { label: 'Months to Repay', value: `${formatValue(results.monthsToRepay)} months` },
        { label: 'Monthly Debt Repayment', value: `${formatValue(results.percentDebtRepaidMonthly)}%` },
        { label: 'Annual ROI', value: `${formatValue(results.annualROI)}%` },
        { label: 'Net Annual Income', value: `$${formatValue(results.netAnnualIncome)}` },
        { label: 'Net Monthly Income', value: `$${formatValue(results.netMonthlyIncome)}` }
      ];

      try {
        metrics.forEach(metric => {
          if (yPos > pageHeight - margin * 4) {
            doc.addPage();
            yPos = margin;
          }
          doc.setFont(undefined, 'bold');
          doc.text(metric.label + ':', margin, yPos);
          doc.setFont(undefined, 'normal');
          doc.text(metric.value, margin + 80, yPos);
          yPos += lineHeight * 1.5;
        });
      } catch (error) {
        console.error('Error writing metrics:', error);
        throw new Error('Failed to write metrics to PDF');
      }

      // AI Analysis Section
      if (results.aiAnalysis) {
        try {
          yPos += lineHeight;
          if (yPos > pageHeight - margin * 4) {
            doc.addPage();
            yPos = margin;
          }

          doc.setFontSize(14);
          doc.setTextColor(52, 144, 220);
          doc.text('Expert Analysis', margin, yPos);
          doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
          yPos += lineHeight * 2;

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
        } catch (error) {
          console.error('Error writing AI analysis:', error);
          throw new Error('Failed to write AI analysis to PDF');
        }
      }

      // Footer with page numbers
      try {
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
      } catch (error) {
        console.error('Error writing page numbers:', error);
        throw new Error('Failed to write page numbers');
      }

      // Save the PDF
      try {
        doc.save('property-analysis-report.pdf');
      } catch (error) {
        console.error('Error saving PDF:', error);
        throw new Error('Failed to save PDF file');
      }

    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF report. Please try again later.');
    }
  };

  return (
    <div className="bg-transparent border-gray-500" style={{ border: '1px solid rgb(107, 114, 128)', borderRadius: '0.75rem', padding: '1.5rem' }}>
      {!results ? (
        <div className="text-center" style={{ color: '#ff0000' }}>No analysis results available</div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#ffffff' }}>Property Analysis Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-transparent rounded">
              <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Total Startup Cost</h3>
              <p className="text-lg"><span style={{ color: '#D35400' }}>$</span><span style={{ color: '#ffffff' }}>{formatValue(results.totalStartupCost)}</span></p>
            </div>
            <div className="p-4 bg-transparent rounded">
              <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Months to Repay</h3>
              <p className="text-lg" style={{ color: '#ffffff' }}>{formatValue(results.monthsToRepay)} months</p>
            </div>
            <div className="p-4 bg-transparent rounded">
              <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Percent of Debt Repaid Monthly</h3>
              <p className="text-lg"><span style={{ color: '#ffffff' }}>{formatValue(results.percentDebtRepaidMonthly)}</span><span style={{ color: '#D35400' }}>%</span></p>
            </div>
            <div className="p-4 bg-transparent rounded">
              <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Annual ROI After Debt Repaid</h3>
              <p className="text-lg"><span style={{ color: '#ffffff' }}>{formatValue(results.annualROI)}</span><span style={{ color: '#D35400' }}>%</span></p>
            </div>
            <div className="p-4 bg-transparent rounded">
              <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Net Annual Income After Debt Repaid</h3>
              <p className="text-lg"><span style={{ color: '#D35400' }}>$</span><span style={{ color: '#ffffff' }}>{formatValue(results.netAnnualIncome)}</span></p>
            </div>
            <div className="p-4 bg-transparent rounded">
              <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Net Monthly Income After Debt Repaid</h3>
              <p className="text-lg"><span style={{ color: '#D35400' }}>$</span><span style={{ color: '#ffffff' }}>{formatValue(results.netMonthlyIncome)}</span></p>
            </div>
          </div>

          {results.aiAnalysis && (
            <div className="mt-6 p-4 bg-transparent rounded">
              <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>AI Analysis</h3>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap" style={{ color: '#ffffff' }}>{results.aiAnalysis}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded hover:bg-[#A04000] transition-colors disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: results ? '#D35400' : 'rgba(211, 84, 0, 0.5)',
                color: '#ffffff'
              }}
              disabled={!results}
            >
              Export PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
