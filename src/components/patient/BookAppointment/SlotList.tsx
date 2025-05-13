"use client";
import React from "react";

export interface SlotVM {
  start_time: string;
  end_time: string;
  label: string;
}

interface SlotListProps {
  slots: SlotVM[];
  selected: SlotVM | null;
  onSelect: (slot: SlotVM) => void;
}

const SlotList: React.FC<SlotListProps> = ({ slots, selected, onSelect }) => {
  if (slots.length === 0) {
    return <p className="text-sm text-gray-500">Brak dostępnych terminów</p>;
  }
  return (
    <ul className="space-y-2">
      {slots.map((slot) => (
        <li key={slot.start_time}>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="slot"
              value={slot.start_time}
              checked={selected?.start_time === slot.start_time}
              onChange={() => onSelect(slot)}
              className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <span>{slot.label}</span>
          </label>
        </li>
      ))}
    </ul>
  );
};

export default SlotList;
