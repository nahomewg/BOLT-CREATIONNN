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

const VALIDATION_RULES = {
  area: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  propertyType: {
    required: true,
    validOptions: propertyTypes,
  },
  cleaningCost: {
    required: true,
    min: 0,
    max: 1000,
  },
  rent: {
    required: true,
    min: 100,
    max: 100000,
  },
  livingRooms: {
    required: true,
    min: 0,
    max: 10,
  },
  bedrooms: {
    required: true,
    min: 1,
    max: 10,
  },
  bathrooms: {
    required: true,
    min: 1,
    max: 10,
  },
  nightlyRate: {
    required: true,
    min: 10,
    max: 10000,
  },
  occupancyRate: {
    required: true,
    min: 1,
    max: 100,
  },
};

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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const rules = VALIDATION_RULES[name];
    if (!rules) return '';

    if (rules.required && !value) {
      return 'This field is required';
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must be less than ${rules.maxLength} characters`;
    }

    if (rules.min !== undefined && Number(value) < rules.min) {
      return `Must be at least ${rules.min}`;
    }

    if (rules.max !== undefined && Number(value) > rules.max) {
      return `Must be less than ${rules.max}`;
    }

    if (rules.validOptions && !rules.validOptions.includes(value)) {
      return 'Please select a valid option';
    }

    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Additional cross-field validations
    if (Number(formData.nightlyRate) <= Number(formData.rent) / 30) {
      newErrors.nightlyRate = 'Nightly rate should be higher than daily rent cost';
    }

    if (Number(formData.bedrooms) + Number(formData.livingRooms) > Number(formData.bathrooms) * 3) {
      newErrors.bathrooms = 'Consider adding more bathrooms for this layout';
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent non-numeric values for number fields
    if (e.target.type === 'number' && value !== '') {
      if (isNaN(value) || value < 0) return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    // Validate field on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, field) => ({
      ...acc,
      [field]: true,
    }), {});
    setTouched(allTouched);

    // Validate all fields
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert string values to numbers for calculations
      const numericFormData = {
        ...formData,
        cleaningCost: Number(formData.cleaningCost),
        rent: Number(formData.rent),
        livingRooms: Number(formData.livingRooms),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        nightlyRate: Number(formData.nightlyRate),
        occupancyRate: Number(formData.occupancyRate),
      };

      const calculatedData = {
        location: formData.area,
        propertyType: formData.propertyType,
        layout: {
          bedrooms: numericFormData.bedrooms,
          bathrooms: numericFormData.bathrooms,
          livingRooms: numericFormData.livingRooms
        },
        financials: {
          monthlyRent: numericFormData.rent,
          cleaningCost: numericFormData.cleaningCost,
          nightlyRate: numericFormData.nightlyRate,
          occupancyRate: numericFormData.occupancyRate,
          totalStartupCost: numericFormData.rent * 2 + (numericFormData.bedrooms * 4000) + (numericFormData.bathrooms * 1000) + (numericFormData.livingRooms * 2000),
          monthsToRepay: ((numericFormData.rent * 2 + (numericFormData.bedrooms * 4000) + (numericFormData.bathrooms * 1000) + (numericFormData.livingRooms * 2000)) / (numericFormData.nightlyRate * 30 * (numericFormData.occupancyRate / 100))).toFixed(2),
          percentDebtRepaidMonthly: (((numericFormData.nightlyRate * 30 * (numericFormData.occupancyRate / 100) - numericFormData.rent) / (numericFormData.rent * 2 + (numericFormData.bedrooms * 4000) + (numericFormData.bathrooms * 1000) + (numericFormData.livingRooms * 2000))) * 100).toFixed(2),
          annualROI: (((numericFormData.nightlyRate * 30 * (numericFormData.occupancyRate / 100) - numericFormData.rent) * 12) / (numericFormData.rent * 2 + (numericFormData.bedrooms * 4000) + (numericFormData.bathrooms * 1000) + (numericFormData.livingRooms * 2000)) * 100).toFixed(2),
          netAnnualIncome: ((numericFormData.nightlyRate * 30 * (numericFormData.occupancyRate / 100) - numericFormData.rent) * 12).toFixed(2),
          netMonthlyIncome: (numericFormData.nightlyRate * 30 * (numericFormData.occupancyRate / 100) - numericFormData.rent).toFixed(2)
        }
      };

      await onCalculate(calculatedData);
    } catch (error) {
      console.error('Calculation error:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to process calculation. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClasses = "w-full p-2 border rounded";
    const errorClasses = touched[fieldName] && errors[fieldName] 
      ? "border-red-500 bg-red-50" 
      : "border-gray-300";
    return `${baseClasses} ${errorClasses}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">Property Analysis Calculator</h2>
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.submit}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        {/* Location field */}
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
            onBlur={handleBlur}
            className={getInputClassName('area')}
          />
          {touched.area && errors.area && (
            <p className="mt-1 text-sm text-red-600">{errors.area}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Property Type */}
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              id="propertyType"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={getInputClassName('propertyType')}
            >
              <option value="">Select Type</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {touched.propertyType && errors.propertyType && (
              <p className="mt-1 text-sm text-red-600">{errors.propertyType}</p>
            )}
          </div>

          {/* Cleaning Cost */}
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
              onBlur={handleBlur}
              className={getInputClassName('cleaningCost')}
              min="0"
              step="5"
            />
            {touched.cleaningCost && errors.cleaningCost && (
              <p className="mt-1 text-sm text-red-600">{errors.cleaningCost}</p>
            )}
          </div>

          {/* Monthly Rent */}
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
              onBlur={handleBlur}
              className={getInputClassName('rent')}
              min="0"
              step="50"
            />
            {touched.rent && errors.rent && (
              <p className="mt-1 text-sm text-red-600">{errors.rent}</p>
            )}
          </div>

          {/* Living Rooms */}
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
              onBlur={handleBlur}
              className={getInputClassName('livingRooms')}
              min="0"
              max="10"
              step="1"
            />
            {touched.livingRooms && errors.livingRooms && (
              <p className="mt-1 text-sm text-red-600">{errors.livingRooms}</p>
            )}
          </div>

          {/* Bedrooms */}
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
              onBlur={handleBlur}
              className={getInputClassName('bedrooms')}
              min="0"
              max="10"
              step="1"
            />
            {touched.bedrooms && errors.bedrooms && (
              <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>
            )}
          </div>

          {/* Bathrooms */}
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
              onBlur={handleBlur}
              className={getInputClassName('bathrooms')}
              min="0"
              max="10"
              step="1"
            />
            {touched.bathrooms && errors.bathrooms && (
              <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>
            )}
          </div>

          {/* Nightly Rate */}
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
              onBlur={handleBlur}
              className={getInputClassName('nightlyRate')}
              min="0"
              step="5"
            />
            {touched.nightlyRate && errors.nightlyRate && (
              <p className="mt-1 text-sm text-red-600">{errors.nightlyRate}</p>
            )}
          </div>

          {/* Occupancy Rate */}
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
              onBlur={handleBlur}
              className={getInputClassName('occupancyRate')}
              min="0"
              max="100"
              step="1"
            />
            {touched.occupancyRate && errors.occupancyRate && (
              <p className="mt-1 text-sm text-red-600">{errors.occupancyRate}</p>
            )}
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

