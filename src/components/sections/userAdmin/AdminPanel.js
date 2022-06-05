import React, { useState } from "react";
import UserName from "../../SidebarActions/UserName";
import Menu from "./scrollTag/Menu";

export default function AdminPanel({ currentUser }) {
  if (!currentUser) {
    return <p className="text-white text-md">loading</p>;
  }

  return (
    <div className="fixed hidden p-3 border-r border-gray-900 sidebarH md:block w-96">
      <h2 className="mb-3 text-white text-md">
        {currentUser?.name ? `Hello ${currentUser.name}` : "Hello"},
      </h2>

      <Menu />
    </div>
  );
}
