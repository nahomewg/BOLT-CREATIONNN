import { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';

export default function AnalysisResults({ results }) {
  if (!results) return null;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Add title
    doc.setFontSize(16);
    doc.text('Property Analysis Report', 105, yPos, { align: 'center' });
    yPos += 20;

    // Add results
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
      doc.text(`${metric.label}: ${metric.value}`, 20, yPos);
      yPos += 10;
    });

    doc.save('property-analysis.pdf');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Export PDF
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Total Startup Cost</h3>
          <p className="text-lg">{results.totalStartupCost}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Months to Repay</h3>
          <p className="text-lg">{results.monthsToRepay}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Percent of Debt Repaid Monthly</h3>
          <p className="text-lg">{results.percentDebtRepaidMonthly}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Annual ROI After Debt Repaid</h3>
          <p className="text-lg">{results.annualROI}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Net Annual Income After Debt Repaid</h3>
          <p className="text-lg">{results.netAnnualIncome}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Net Monthly Income After Debt Repaid</h3>
          <p className="text-lg">{results.netMonthlyIncome}</p>
        </div>
      </div>
    </div>
  );
}
