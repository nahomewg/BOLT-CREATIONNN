import { useState } from 'react';

const propertyTypes = [
  'Apartment',
  'House',
  'Condo',
  'Villa',
  'Townhouse',
  'Cabin',
  'Cottage',
  'Loft',
  'Studio',
  'Resort',
];

export default function PropertyCalculator({ onCalculate }) {
  const [formData, setFormData] = useState({
    area: '',
    propertyType: '',
    cleaningCost: '',
    rent: '',
    livingRooms: '',
    bedrooms: '',
    bathrooms: '',
    nightlyRate: '',
    occupancyRate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onCalculate({
        location: formData.area,
        propertyType: formData.propertyType,
        layout: {
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          livingRooms: formData.livingRooms
        },
        financials: {
          monthlyRent: formData.rent,
          cleaningCost: formData.cleaningCost,
          nightlyRate: formData.nightlyRate,
          occupancyRate: formData.occupancyRate,
          totalStartupCost: formData.rent * 2 + (formData.bedrooms * 4000) + (formData.bathrooms * 1000) + (formData.livingRooms * 2000),
          monthsToRepay: ((formData.rent * 2 + (formData.bedrooms * 4000) + (formData.bathrooms * 1000) + (formData.livingRooms * 2000)) / (formData.nightlyRate * 30 * (formData.occupancyRate / 100))).toFixed(2),
          percentDebtRepaidMonthly: (((formData.nightlyRate * 30 * (formData.occupancyRate / 100) - formData.rent) / (formData.rent * 2 + (formData.bedrooms * 4000) + (formData.bathrooms * 1000) + (formData.livingRooms * 2000))) * 100).toFixed(2),
          annualROI: (((formData.nightlyRate * 30 * (formData.occupancyRate / 100) - formData.rent) * 12) / (formData.rent * 2 + (formData.bedrooms * 4000) + (formData.bathrooms * 1000) + (formData.livingRooms * 2000)) * 100).toFixed(2),
          netAnnualIncome: ((formData.nightlyRate * 30 * (formData.occupancyRate / 100) - formData.rent) * 12).toFixed(2),
          netMonthlyIncome: (formData.nightlyRate * 30 * (formData.occupancyRate / 100) - formData.rent).toFixed(2)
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">Property Analysis Calculator</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            name="area"
            placeholder="Location/Area (e.g., Downtown Seattle, WA)"
            value={formData.area}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          >
            <option value="">Select Property Type</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="cleaningCost"
            placeholder="Cleaning Cost per Booking ($)"
            value={formData.cleaningCost}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />

          <input
            type="number"
            name="rent"
            placeholder="Monthly Rent ($)"
            value={formData.rent}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />

          <input
            type="number"
            name="livingRooms"
            placeholder="Number of Living Rooms"
            value={formData.livingRooms}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />

          <input
            type="number"
            name="bedrooms"
            placeholder="Number of Bedrooms"
            value={formData.bedrooms}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />

          <input
            type="number"
            name="bathrooms"
            placeholder="Number of Bathrooms"
            value={formData.bathrooms}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />

          <input
            type="number"
            name="nightlyRate"
            placeholder="Average Nightly Rate ($)"
            value={formData.nightlyRate}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />

          <input
            type="number"
            name="occupancyRate"
            placeholder="Occupancy Rate (%)"
            value={formData.occupancyRate}
            onChange={handleInputChange}
            className="p-2 border rounded"
            min="0"
            max="100"
            required
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-12 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </div>
            ) : (
              'Calculate'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

