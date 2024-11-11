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
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
            Location/Area
          </label>
          <input
            id="area"
            type="text"
            name="area"
            placeholder="e.g., Downtown Seattle, WA"
            value={formData.area}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              id="propertyType"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Type</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cleaningCost" className="block text-sm font-medium text-gray-700 mb-1">
              Cleaning Cost
            </label>
            <input
              id="cleaningCost"
              type="number"
              name="cleaningCost"
              placeholder="$ per cleaning"
              value={formData.cleaningCost}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              step="5"
              required
            />
          </div>

          <div>
            <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent
            </label>
            <input
              id="rent"
              type="number"
              name="rent"
              placeholder="$ per month"
              value={formData.rent}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              step="50"
              required
            />
          </div>

          <div>
            <label htmlFor="livingRooms" className="block text-sm font-medium text-gray-700 mb-1">
              Living Rooms
            </label>
            <input
              id="livingRooms"
              type="number"
              name="livingRooms"
              placeholder="Number of living rooms"
              value={formData.livingRooms}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              max="10"
              step="1"
              required
            />
          </div>

          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms
            </label>
            <input
              id="bedrooms"
              type="number"
              name="bedrooms"
              placeholder="Number of bedrooms"
              value={formData.bedrooms}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              max="10"
              step="1"
              required
            />
          </div>

          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
              Bathrooms
            </label>
            <input
              id="bathrooms"
              type="number"
              name="bathrooms"
              placeholder="Number of bathrooms"
              value={formData.bathrooms}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              max="10"
              step="1"
              required
            />
          </div>

          <div>
            <label htmlFor="nightlyRate" className="block text-sm font-medium text-gray-700 mb-1">
              Nightly Rate
            </label>
            <input
              id="nightlyRate"
              type="number"
              name="nightlyRate"
              placeholder="$ per night"
              value={formData.nightlyRate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              step="5"
              required
            />
          </div>

          <div>
            <label htmlFor="occupancyRate" className="block text-sm font-medium text-gray-700 mb-1">
              Occupancy Rate
            </label>
            <input
              id="occupancyRate"
              type="number"
              name="occupancyRate"
              placeholder="Expected occupancy %"
              value={formData.occupancyRate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              max="100"
              step="1"
              required
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-1/2 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
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
              'Calculate Analysis'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

