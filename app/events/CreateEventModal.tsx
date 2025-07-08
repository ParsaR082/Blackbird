'use client';

import React, { useState } from 'react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (eventData: EventData) => void;
}

interface EventData {
  title: string;
  description: string;
  dateTime: string;
  duration: number;
  maxAttendees: number;
  location: string;
  category: string;
  tags: {
    featured: boolean;
    upcoming: boolean;
    registrationOpen: boolean;
  };
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<EventData>({
    title: '',
    description: '',
    dateTime: '',
    duration: 1,
    maxAttendees: 50,
    location: '',
    category: 'Workshops',
    tags: {
      featured: false,
      upcoming: false,
      registrationOpen: false
    }
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        tags: {
          ...prev.tags,
          [name]: checkbox.checked
        }
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Event Data:', formData);
    if (onSubmit) {
      onSubmit(formData);
    }
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      dateTime: '',
      duration: 1,
      maxAttendees: 50,
      location: '',
      category: 'Workshops',
      tags: {
        featured: false,
        upcoming: false,
        registrationOpen: false
      }
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl bg-[#0F0F0F] rounded-xl shadow-2xl border border-[#2A2A2A] max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-5 pb-3 border-b border-[#2A2A2A]">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white">Create Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full hover:bg-[#1A1A1A] text-lg sm:text-xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4">
          {/* Title and Category Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="title" className="block text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-[#1E1E1E] border border-[#333] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent text-xs sm:text-sm"
                placeholder="Enter event title"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-[#1E1E1E] border border-[#333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent text-xs sm:text-sm"
              >
                <option value="Workshops">Workshops</option>
                <option value="Hackathons">Hackathons</option>
                <option value="Conferences">Conferences</option>
                <option value="Networking">Networking</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-[#1E1E1E] border border-[#333] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent resize-none text-xs sm:text-sm"
              placeholder="Enter event description"
            />
          </div>

          {/* Date & Time and Location Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="dateTime" className="block text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">
                Date & Time
              </label>
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-[#1E1E1E] border border-[#333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent text-xs sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-[#1E1E1E] border border-[#333] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent text-xs sm:text-sm"
                placeholder="Enter event location"
              />
            </div>
          </div>

          {/* Duration and Max Attendees - Side by Side */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="duration" className="block text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">
                Duration (hrs)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                max="24"
                required
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-[#1E1E1E] border border-[#333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent text-xs sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="maxAttendees" className="block text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">
                Capacity
              </label>
              <input
                type="number"
                id="maxAttendees"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                min="1"
                required
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-[#1E1E1E] border border-[#333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2 font-medium">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.tags.featured}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 transition-all duration-200 ${
                  formData.tags.featured 
                    ? 'bg-[#FFD700] bg-opacity-15 border-[#FFD700] text-[#FFD700] shadow-lg' 
                    : 'bg-[#1E1E1E] border-[#333] text-gray-400 hover:border-[#FFD700] hover:bg-[#FFD700] hover:bg-opacity-5'
                }`}>
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    formData.tags.featured ? 'border-[#FFD700] bg-[#FFD700]' : 'border-[#333]'
                  }`}>
                    {formData.tags.featured && (
                      <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs font-medium">Featured</span>
                </div>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="upcoming"
                  checked={formData.tags.upcoming}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 transition-all duration-200 ${
                  formData.tags.upcoming 
                    ? 'bg-[#2D8EFF] bg-opacity-15 border-[#2D8EFF] text-[#2D8EFF] shadow-lg' 
                    : 'bg-[#1E1E1E] border-[#333] text-gray-400 hover:border-[#2D8EFF] hover:bg-[#2D8EFF] hover:bg-opacity-5'
                }`}>
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    formData.tags.upcoming ? 'border-[#2D8EFF] bg-[#2D8EFF]' : 'border-[#333]'
                  }`}>
                    {formData.tags.upcoming && (
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs font-medium">Upcoming</span>
                </div>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="registrationOpen"
                  checked={formData.tags.registrationOpen}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 transition-all duration-200 ${
                  formData.tags.registrationOpen 
                    ? 'bg-[#3AB54B] bg-opacity-15 border-[#3AB54B] text-[#3AB54B] shadow-lg' 
                    : 'bg-[#1E1E1E] border-[#333] text-gray-400 hover:border-[#3AB54B] hover:bg-[#3AB54B] hover:bg-opacity-5'
                }`}>
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    formData.tags.registrationOpen ? 'border-[#3AB54B] bg-[#3AB54B]' : 'border-[#333]'
                  }`}>
                    {formData.tags.registrationOpen && (
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs font-medium">Registration Open</span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-[#2A2A2A]">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-[#2A2A2A] hover:bg-[#404040] text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-[#3498DB] hover:bg-[#5DADE2] text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105 text-xs sm:text-sm"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
