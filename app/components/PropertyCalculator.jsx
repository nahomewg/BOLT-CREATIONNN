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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate monthly revenue
    const daysPerMonth = 30;
    const monthlyRevenue = formData.nightlyRate * daysPerMonth * (formData.occupancyRate / 100);
    
    // Create the analysis object directly instead of a prompt string
    const analysis = {
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
        monthsToRepay: ((formData.rent * 2 + (formData.bedrooms * 4000) + (formData.bathrooms * 1000) + (formData.livingRooms * 2000)) / (monthlyRevenue - formData.rent)).toFixed(2),
        percentDebtRepaidMonthly: (((monthlyRevenue - formData.rent) / (formData.rent * 2 + (formData.bedrooms * 4000) + (formData.bathrooms * 1000) + (formData.livingRooms * 2000))) * 100).toFixed(2),
        annualROI: (((monthlyRevenue - formData.rent) * 12) / (formData.rent * 2 + (formData.bedrooms * 4000) + (formData.bathrooms * 1000) + (formData.livingRooms * 2000)) * 100).toFixed(2),
        netAnnualIncome: ((monthlyRevenue - formData.rent) * 12).toFixed(2),
        netMonthlyIncome: (monthlyRevenue - formData.rent).toFixed(2)
      }
    };

    onCalculate(analysis);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">Property Analysis Calculator</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
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

        <div>
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Property Type</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="number"
            name="cleaningCost"
            placeholder="Cleaning Cost per Booking ($)"
            value={formData.cleaningCost}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <input
            type="number"
            name="rent"
            placeholder="Monthly Rent ($)"
            value={formData.rent}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <input
            type="number"
            name="livingRooms"
            placeholder="Number of Living Rooms"
            value={formData.livingRooms}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <input
            type="number"
            name="bedrooms"
            placeholder="Number of Bedrooms"
            value={formData.bedrooms}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <input
            type="number"
            name="bathrooms"
            placeholder="Number of Bathrooms"
            value={formData.bathrooms}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <input
            type="number"
            name="nightlyRate"
            placeholder="Average Nightly Rate ($)"
            value={formData.nightlyRate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <input
            type="number"
            name="occupancyRate"
            placeholder="Occupancy Rate (%)"
            value={formData.occupancyRate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            min="0"
            max="100"
            required
          />
        </div>

        <button
          type="submit"
          className="col-span-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Calculate Analysis
        </button>
      </form>
    </div>
  );
}
