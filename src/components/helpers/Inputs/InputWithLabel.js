import React from "react";

export default function InputWithLabel({ title, type, placeholder }) {
  return (
    <div>
      <label
        htmlFor="email"
        className="block text-xs font-medium text-inputGray"
      >
        {title}
      </label>
      <div className="px-2 mt-1 rounded-md h-11 bg-darkAlt">
        <input
          type={type}
          name="email"
          id="email"
          className="block w-full h-full bg-transparent border-none rounded-md shadow-sm text-inputGray sm:text-sm placeholder:text-xs outline-hidden focus:border-none focus:outline-none placeholder:text-textGray"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
