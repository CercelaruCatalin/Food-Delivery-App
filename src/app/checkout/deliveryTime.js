"use client";
import { useState, useEffect } from "react";
import { ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function DeliveryTime({ onClose, onSelectTime, restaurants }) {
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("today");
  
  // Find the earliest closing time among all restaurants in the cart
  useEffect(() => {
    generateAvailableTimes();
  }, [selectedDate, restaurants]);
  
  const generateAvailableTimes = () => {
    // Get current date and time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const roundedMinute = currentMinute < 30 ? 30 : 0;
    const startHour = roundedMinute === 0 ? currentHour + 1 : currentHour;
    
    // Find earliest closing time among all restaurants
    let earliestClosingHour = 23; // Default to 11 PM
    let earliestClosingMinutes = 0;
    
    restaurants.forEach(restaurant => {
      const closingTime = restaurant.closes || "23:00:00";
      const [hours, minutes] = closingTime.split(":");
      const closingHour = parseInt(hours);
      const closingMinutes = parseInt(minutes);
      
      // Compare closing times
      if (closingHour < earliestClosingHour || 
          (closingHour === earliestClosingHour && closingMinutes < earliestClosingMinutes)) {
        earliestClosingHour = closingHour;
        earliestClosingMinutes = closingMinutes;
      }
    });
    
    // For "tomorrow" option, use full range
    const startingHour = selectedDate === "today" ? startHour : 10;
    const endingHour = earliestClosingHour;
    
    const times = [];
    
    // Calculate last available time (30 minutes before closing)
    const lastAvailableHour = earliestClosingHour;
    const lastAvailableMinute = earliestClosingMinutes - 30;
    
    // Adjust if we need to go to the previous hour
    let adjustedLastHour = lastAvailableHour;
    let adjustedLastMinute = lastAvailableMinute;
    
    if (lastAvailableMinute < 0) {
      adjustedLastHour = lastAvailableHour - 1;
      adjustedLastMinute = 60 + lastAvailableMinute; // Add 60 to the negative minutes
    }
    
    // Generate time slots every 15 minutes
    for (let hour = startingHour; hour <= endingHour; hour++) {
      // Skip if hour is past the adjusted last hour
      if (hour > adjustedLastHour) continue;
      
      // For each hour, determine which 15-minute slots to add
      const minutes = [0, 15, 30, 45];
      
      // If it's today and we're on the current hour, skip minutes that have already passed
      if (selectedDate === "today" && hour === currentHour) {
        // Only include minute slots that are at least 30 minutes in the future
        const futureMinutes = minutes.filter(min => min > currentMinute + 30);
        futureMinutes.forEach(min => {
          // Only add if this time slot is before the last available time
          if (hour < adjustedLastHour || (hour === adjustedLastHour && min <= adjustedLastMinute)) {
            times.push(`${hour}:${min.toString().padStart(2, '0')}`);
          }
        });
      } 
      // For the last available hour, only add slots before the adjusted last minute
      else if (hour === adjustedLastHour) {
        minutes.forEach(min => {
          if (min <= adjustedLastMinute) {
            times.push(`${hour}:${min.toString().padStart(2, '0')}`);
          }
        });
      } 
      // For all other hours, add all 15-minute slots
      else {
        minutes.forEach(min => {
          times.push(`${hour}:${min.toString().padStart(2, '0')}`);
        });
      }
    }
    
    setAvailableTimes(times);
    
    // Reset selected time when changing dates
    setSelectedTime(null);
  };
  
  const formatTimeDisplay = (timeStr) => {
    const [hours, minutes] = timeStr.split(":");
    return `${hours}:${minutes}`;
  };
  
  const handleSelectTime = () => {
    if (!selectedTime) return;
    
    const dateLabel = selectedDate === "today" ? "Today" : "Tomorrow";
    const displayTime = `${dateLabel} at ${formatTimeDisplay(selectedTime)}`;
    
    // Create a Date object for the selected time
    const now = new Date();
    const scheduledDate = new Date(now);
    
    // If tomorrow is selected, add a day
    if (selectedDate === "tomorrow") {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    // Set the selected time
    const [hours, minutes] = selectedTime.split(":");
    scheduledDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    // Send back the formatted display string and the actual Date object
    onSelectTime(displayTime, scheduledDate);
  };
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center">
            <ClockIcon className="h-6 w-6 text-primary mr-2" />
            Select Delivery Time
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 pb-4">
            {/* Date Tabs */}
            <div className="flex mb-4 border-b">
              <button
                className={`py-2 px-4 ${selectedDate === "today" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
                onClick={() => setSelectedDate("today")}
              >
                Today
              </button>
              <button
                className={`py-2 px-4 ${selectedDate === "tomorrow" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
                onClick={() => setSelectedDate("tomorrow")}
              >
                Tomorrow
              </button>
            </div>
          </div>
          
          {/* Time Grid - Scrollable Area */}
          <div className="flex-1 px-6 pb-4 overflow-y-auto">
            {availableTimes.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 pb-4">
                {availableTimes.map((time, index) => (
                  <button
                    key={index}
                    className={`py-2 px-3 border rounded-md transition-colors ${
                      selectedTime === time 
                        ? "bg-primary text-white border-primary" 
                        : "border-gray-300 hover:border-primary hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {formatTimeDisplay(time)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-center text-gray-500">
                  No available delivery times for {selectedDate}.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer*/}
        <div className="p-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleSelectTime}
            disabled={!selectedTime}
            className="w-full bg-primary hover:bg-primaryhov text-white py-3 px-6 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Confirm {selectedTime && `- ${formatTimeDisplay(selectedTime)}`}
          </button>
        </div>
      </div>
    </div>
  );
}